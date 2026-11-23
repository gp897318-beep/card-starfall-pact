// main.ts — entrypoint for STARFALL PACT (best-card-game-20261122-1826).
// Copies game/ and screenshots/ from beside this file into the output dir
// (MAKEFUN_OUTPUT_DIR, or /output) and writes dossier.json with buildDossier.
import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });

for (const name of ['game', 'screenshots']) {
  const src = join(here, name);
  if (existsSync(src)) cpSync(src, join(out, name), { recursive: true });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

const entries = readdirSync(out).sort();
const dossierBytes = statSync(join(out, 'dossier.json')).size;
console.log('wrote ' + out + ': ' + entries.join(', ') + ' (dossier.json ' + dossierBytes + ' bytes)');
