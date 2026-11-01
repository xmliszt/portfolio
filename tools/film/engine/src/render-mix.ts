export const SAMPLE_RATE = 48_000;

/** Return the linear gain for `value` decibels. */
export const db = (value: number) => 10 ** (value / 20);

export type LoadAudio = (url: string) => Promise<AudioBuffer>;

async function load(context: BaseAudioContext, url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`missing ${url}`);
  return context.decodeAudioData(await response.arrayBuffer());
}

/**
 * Render `seconds` of stereo sound: `music` (looped between `loop.start` and its end when given) faded out from `fadeOutAt`,
 * under whatever `schedule` connects to `master`. Return it as 16-bit stereo WAV bytes in base64.
 */
export async function renderMix(options: {
  seconds: number;
  fadeOutAt: number;
  music: { url: string; gainDb: number; loop?: { start: number; length: number } };
  schedule: (scene: { context: OfflineAudioContext; master: GainNode; load: LoadAudio }) => Promise<void>;
}) {
  const context = new OfflineAudioContext(2, Math.ceil(options.seconds * SAMPLE_RATE), SAMPLE_RATE);
  const master = context.createGain();
  master.connect(context.destination);
  const cache: { [url: string]: Promise<AudioBuffer> } = {};
  const get = (url: string) => (cache[url] ??= load(context, url));

  const music = context.createBufferSource();
  music.buffer = await get(options.music.url);
  if (options.music.loop) {
    music.loop = true;
    music.loopStart = options.music.loop.start;
    music.loopEnd = options.music.loop.start + options.music.loop.length;
  }
  const musicGain = context.createGain();
  musicGain.gain.setValueAtTime(db(options.music.gainDb), 0);
  musicGain.gain.setValueAtTime(db(options.music.gainDb), options.fadeOutAt);
  musicGain.gain.linearRampToValueAtTime(0, options.seconds);
  music.connect(musicGain).connect(master);
  music.start(0);

  await options.schedule({ context, master, load: get });

  const rendered = await context.startRendering();
  const left = rendered.getChannelData(0);
  const right = rendered.getChannelData(1);
  const bytes = new Uint8Array(44 + left.length * 4);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) => [...s].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + left.length * 4, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, left.length * 4, true);
  for (let i = 0; i < left.length; i++) {
    view.setInt16(44 + i * 4, Math.max(-1, Math.min(1, left[i]!)) * 32767, true);
    view.setInt16(46 + i * 4, Math.max(-1, Math.min(1, right[i]!)) * 32767, true);
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}
