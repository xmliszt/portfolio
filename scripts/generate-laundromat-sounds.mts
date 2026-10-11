import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

import { LOOP_NAMES } from "@/lib/laundromat/audio/sound-names";
import {
  SOUND_SAMPLE_BASE_PATH,
  SOUND_SAMPLES,
} from "@/lib/laundromat/audio/sound-samples";

const API_URL =
  "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128";

const apiKey = process.env.ELEVENLABS_API_KEY;
if (apiKey === undefined || apiKey === "") {
  console.error("Set ELEVENLABS_API_KEY in .env or the shell first.");
  process.exit(1);
}

const args = process.argv.slice(2);
const isForced = args.includes("--force");
const onlyNames = args.filter((arg) => !arg.startsWith("--"));
const outputDir = join(process.cwd(), "public", SOUND_SAMPLE_BASE_PATH);
mkdirSync(outputDir, { recursive: true });

const entries = Object.entries(SOUND_SAMPLES).filter(
  ([name]) => onlyNames.length === 0 || onlyNames.includes(name)
);

for (const [name, sample] of entries) {
  const path = join(outputDir, `${name}.mp3`);
  if (sample.kind === "recorded") {
    console.log(`skip ${name} (recorded from ${sample.sourceUrl})`);
    continue;
  }
  if (sample.kind === "synthesized") {
    rmSync(path, { force: true });
    console.log(`skip ${name} (synthesized in the browser)`);
    continue;
  }
  if (existsSync(path) && !isForced) {
    console.log(`skip ${name} (exists, pass --force to redo)`);
    continue;
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: sample.prompt,
      duration_seconds: sample.durationSeconds,
      prompt_influence: sample.promptInfluence,
      loop: LOOP_NAMES.some((loop) => loop === name),
      model_id: "eleven_text_to_sound_v2",
    }),
  });
  if (!response.ok) {
    console.error(`fail ${name}: ${response.status} ${await response.text()}`);
    process.exitCode = 1;
    continue;
  }
  writeFileSync(path, Buffer.from(await response.arrayBuffer()));
  console.log(`wrote ${name}`);
}

const writtenNames = readdirSync(outputDir)
  .filter((file) => file.endsWith(".mp3"))
  .map((file) => file.replace(/\.mp3$/, ""));
writeFileSync(
  join(outputDir, "index.json"),
  `${JSON.stringify(writtenNames, undefined, 2)}\n`
);
console.log(`index lists ${writtenNames.length} samples`);
