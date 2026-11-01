// node engine/build.mjs --film=films/paws
// Bundle the film's entries (listed in its build.config.mjs) into <film>/out/, with @/ resolved against the repo.
// Page bundles are browser IIFEs; an entry with platform "node" is bundled as CommonJS for node.
import { build } from 'esbuild';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const film = resolve(process.argv.find(a => a.startsWith('--film='))?.slice('--film='.length) ?? '.');
const repo = fileURLToPath(new URL('../../..', import.meta.url));
const { entries } = await import(pathToFileURL(resolve(film, 'build.config.mjs')).href);

const common = { bundle: true, absWorkingDir: film, tsconfig: resolve(repo, 'tsconfig.json'), logLevel: 'warning' };
for (const { entry, outfile, platform, plugins } of entries) {
  await build({
    ...common,
    entryPoints: [entry],
    outfile,
    plugins,
    ...(platform === 'node' ? { platform: 'node', format: 'cjs' } : { format: 'iife', target: 'chrome120' }),
  });
}
