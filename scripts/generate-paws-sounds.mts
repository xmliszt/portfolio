import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { getMeowPrompt } from "@/lib/paws/profile/get-meow-prompt";
import {
  AGES,
  MOODS,
  VOICES,
  type VoiceSettings,
} from "@/lib/paws/voice-settings";

const API_URL =
  "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";
const SAMPLE_RATE = 22050;

type Sound =
  | { kind: "meow"; name: string; voice: VoiceSettings }
  | { kind: "trill"; name: string; variant: 1 | 2 }
  | { kind: "purr"; name: string; variant: 1 | 2 };

const args = process.argv.slice(2);
const isForced = args.includes("--force");
const isPlaceholder = args.includes("--placeholders");
const outputDir = join(process.cwd(), "public", "paws", "sounds");
mkdirSync(outputDir, { recursive: true });

const sounds: Sound[] = [
  ...AGES.flatMap((age) =>
    VOICES.flatMap((voice) =>
      MOODS.map(
        (mood): Sound => ({
          kind: "meow",
          name: `meow-${age}-${voice}-${mood}`,
          voice: { age, voice, mood },
        })
      )
    )
  ),
  { kind: "trill", name: "trill-1", variant: 1 },
  { kind: "trill", name: "trill-2", variant: 2 },
  { kind: "purr", name: "purr-1", variant: 1 },
  { kind: "purr", name: "purr-2", variant: 2 },
];

function getRequest(sound: Sound) {
  switch (sound.kind) {
    case "meow":
      return {
        text: getMeowPrompt({ normalizedText: "meow", voice: sound.voice }),
        seconds: 1.5,
      };
    case "trill":
      return {
        text:
          sound.variant === 1
            ? "a cat's short happy trill, rolling chirrup, close mic, no background, no music"
            : "a cat's soft questioning brrrp trill, rising, close mic, no background, no music",
        seconds: 0.8,
      };
    case "purr":
      return {
        text:
          sound.variant === 1
            ? "a cat purring softly and steadily, close mic, no background, no music"
            : "a cat purring deep and slow, content, close mic, no background, no music",
        seconds: 2,
      };
  }
}

function createRandom(seed: number) {
  const state = { value: seed >>> 0 };
  return () => {
    state.value = (state.value + 0x6d2b79f5) >>> 0;
    const mixed = Math.imul(
      state.value ^ (state.value >>> 15),
      1 | state.value
    );
    const next = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function seedOf(name: string) {
  return Array.from(name).reduce(
    (hash, character) =>
      Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261
  );
}

const BASE_PITCH = { squeaky: 880, soft: 620, raspy: 540, deep: 360 };
const AGE_PITCH = { kitten: 1.35, adult: 1, old: 0.82 };
const AGE_LENGTH = { kitten: 0.75, adult: 1, old: 1.15 };

function synthesizeMeow(voice: VoiceSettings, random: () => number) {
  const syllables = voice.mood === "chatty" ? 2 : 1;
  const syllableSeconds =
    (voice.mood === "sleepy" ? 0.9 : voice.mood === "grumpy" ? 0.75 : 0.42) *
    AGE_LENGTH[voice.age];
  const gapSeconds = 0.08;
  const totalSeconds =
    syllables * syllableSeconds + (syllables - 1) * gapSeconds + 0.05;
  const base =
    BASE_PITCH[voice.voice] *
    AGE_PITCH[voice.age] *
    (voice.mood === "grumpy" ? 0.8 : 1);
  const harmonics =
    voice.voice === "squeaky" ? 3 : voice.voice === "soft" ? 4 : 7;
  const breath =
    voice.voice === "soft" ? 0.18 : voice.voice === "raspy" ? 0.35 : 0.05;
  const samples = new Float32Array(Math.round(totalSeconds * SAMPLE_RATE));
  const phase = { value: 0 };
  samples.forEach((_, index) => {
    const time = index / SAMPLE_RATE;
    const syllable = Math.floor(time / (syllableSeconds + gapSeconds));
    const local = time - syllable * (syllableSeconds + gapSeconds);
    if (syllable >= syllables || local > syllableSeconds) return;
    const progress = local / syllableSeconds;
    const contour =
      voice.mood === "sleepy"
        ? 1.05 - 0.3 * progress
        : 0.9 +
          0.35 * Math.sin(Math.PI * Math.min(progress * 1.2, 1)) -
          0.15 * progress +
          (syllable === 1 ? 0.12 : 0);
    const wobble =
      voice.age === "old" ? 1 + 0.03 * Math.sin(2 * Math.PI * 6 * time) : 1;
    phase.value += (2 * Math.PI * base * contour * wobble) / SAMPLE_RATE;
    const brightness = 0.35 + 0.65 * Math.sin(Math.PI * progress);
    const tone = Array.from({ length: harmonics }, (_, harmonic) => {
      const order = harmonic + 1;
      return (
        (Math.sin(phase.value * order) * brightness ** (order - 1)) / order
      );
    }).reduce((sum, value) => sum + value, 0);
    const growl =
      voice.mood === "grumpy"
        ? 0.65 + 0.35 * Math.sin(2 * Math.PI * 32 * time)
        : 1;
    const envelope =
      Math.min(local / 0.03, 1) * Math.min((syllableSeconds - local) / 0.12, 1);
    samples[index] =
      (tone * (1 - breath) + (random() * 2 - 1) * breath) *
      envelope *
      growl *
      0.5;
  });
  return samples;
}

function synthesizeTrill(variant: 1 | 2, random: () => number) {
  const seconds = variant === 1 ? 0.45 : 0.6;
  const samples = new Float32Array(Math.round(seconds * SAMPLE_RATE));
  const phase = { value: 0 };
  samples.forEach((_, index) => {
    const time = index / SAMPLE_RATE;
    const progress = time / seconds;
    const pitch =
      variant === 1 ? 520 + 260 * progress : 480 + 380 * progress * progress;
    phase.value += (2 * Math.PI * pitch) / SAMPLE_RATE;
    const roll =
      0.55 + 0.45 * Math.sin(2 * Math.PI * (variant === 1 ? 28 : 22) * time);
    const envelope =
      Math.min(time / 0.02, 1) * Math.min((seconds - time) / 0.1, 1);
    const tone =
      Math.sin(phase.value) +
      0.4 * Math.sin(phase.value * 2) +
      0.2 * Math.sin(phase.value * 3);
    samples[index] =
      (tone * 0.9 + (random() * 2 - 1) * 0.1) * roll * envelope * 0.4;
  });
  return samples;
}

function synthesizePurr(variant: 1 | 2, random: () => number) {
  const seconds = 1.6;
  const rate = variant === 1 ? 26 : 21;
  const samples = new Float32Array(Math.round(seconds * SAMPLE_RATE));
  const lowpass = { value: 0 };
  samples.forEach((_, index) => {
    const time = index / SAMPLE_RATE;
    const pulse = Math.max(Math.sin(2 * Math.PI * rate * time), 0) ** 3;
    lowpass.value += 0.08 * (random() * 2 - 1 - lowpass.value);
    const body = Math.sin(2 * Math.PI * (variant === 1 ? 52 : 44) * time);
    const breathing = 0.75 + 0.25 * Math.sin((2 * Math.PI * time) / seconds);
    const envelope =
      Math.min(time / 0.15, 1) * Math.min((seconds - time) / 0.25, 1);
    samples[index] =
      (lowpass.value * 2.2 + body * 0.35) * pulse * breathing * envelope * 0.6;
  });
  return samples;
}

function synthesize(sound: Sound) {
  const random = createRandom(seedOf(sound.name));
  switch (sound.kind) {
    case "meow":
      return synthesizeMeow(sound.voice, random);
    case "trill":
      return synthesizeTrill(sound.variant, random);
    case "purr":
      return synthesizePurr(sound.variant, random);
  }
}

function toWav(samples: Float32Array) {
  const peak =
    samples.reduce((max, sample) => Math.max(max, Math.abs(sample)), 0) || 1;
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) =>
    buffer.writeInt16LE(
      Math.round((sample / peak) * 0.8 * 32767),
      44 + index * 2
    )
  );
  return buffer;
}

function writePlaceholder(sound: Sound, path: string) {
  const encoded = spawnSync(
    "ffmpeg",
    [
      "-loglevel",
      "error",
      "-y",
      "-f",
      "wav",
      "-i",
      "pipe:0",
      "-ac",
      "1",
      "-ar",
      "22050",
      "-b:a",
      "32k",
      "-f",
      "mp3",
      path,
    ],
    { input: toWav(synthesize(sound)) }
  );
  if (encoded.error !== undefined || encoded.status !== 0) {
    console.error(
      `fail ${sound.name}: ffmpeg is needed to encode placeholders (${encoded.stderr?.toString() ?? encoded.error})`
    );
    process.exit(1);
  }
}

async function writeGenerated(sound: Sound, path: string, apiKey: string) {
  const request = getRequest(sound);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: request.text,
      duration_seconds: request.seconds,
      prompt_influence: 0.6,
      model_id: "eleven_text_to_sound_v2",
    }),
  });
  if (!response.ok) {
    console.error(
      `fail ${sound.name}: ${response.status} ${await response.text()}`
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(path, Buffer.from(await response.arrayBuffer()));
}

const apiKey = process.env.ELEVENLABS_API_KEY ?? "";
if (!isPlaceholder && apiKey === "") {
  console.error(
    "Set ELEVENLABS_API_KEY in .env or the shell first, or pass --placeholders."
  );
  process.exit(1);
}

for (const sound of sounds) {
  const path = join(outputDir, `${sound.name}.mp3`);
  if (existsSync(path) && !isForced) {
    console.log(`skip ${sound.name} (exists, pass --force to redo)`);
    continue;
  }
  if (isPlaceholder) {
    writePlaceholder(sound, path);
  } else {
    await writeGenerated(sound, path, apiKey);
  }
  console.log(`wrote ${sound.name}${isPlaceholder ? " (placeholder)" : ""}`);
}
