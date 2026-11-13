#!/usr/bin/env node
/**
 * Test preusmeritev s stare strani (SPEC, razdelek 8).
 *
 * Brez parametrov (po `npm run build`): za vsak URL iz scripts/fixtures/old-site-urls.txt
 * in vsako pravilo v vercel.json preveri, da vodi s 301/302 na stran, ki obstaja v dist/,
 * ali pa je že obstoječa nova stran. Preveri tudi, da pravilo ne prekrije obstoječe strani.
 *
 * Z `--base https://...` preveri isto na živi postavitvi (predogled ali produkcija):
 *   node scripts/test-redirects.mjs --base https://kalmia.si
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const redirects = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8')).redirects ?? [];
const oldUrls = readFileSync(join(ROOT, 'scripts/fixtures/old-site-urls.txt'), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const baseIdx = process.argv.indexOf('--base');
const base = baseIdx > -1 ? process.argv[baseIdx + 1]?.replace(/\/$/, '') : null;

const pageExists = (path) => {
  const clean = path.replace(/\/+$/, '') || '/';
  if (clean === '/') return existsSync(join(DIST, 'index.html'));
  return existsSync(join(DIST, `${clean}.html`)) || existsSync(join(DIST, clean, 'index.html')) || existsSync(join(DIST, clean));
};

const errors = [];
let ok = 0;

if (!base) {
  if (!existsSync(DIST)) {
    console.error('Mapa dist/ ne obstaja. Najprej zaženi `npm run build`.');
    process.exit(1);
  }
  const bySource = new Map(redirects.map((r) => [r.source, r]));
  for (const r of redirects) {
    if (![301, 302].includes(r.statusCode)) errors.push(`${r.source}: status ${r.statusCode}`);
    if (!pageExists(r.destination.split('#')[0])) errors.push(`${r.source} → ${r.destination}: cilj ne obstaja`);
    if (pageExists(r.source)) errors.push(`${r.source}: preusmeritev prekrije obstoječo stran`);
  }
  for (const url of new Set([...oldUrls, ...redirects.map((r) => r.source)])) {
    const r = bySource.get(url);
    if (r) ok++;
    else if (pageExists(url)) ok++; // npr. "/" in "/blog" obstajata tudi na novi strani
    else errors.push(`${url}: ni preusmeritve in stran ne obstaja (404)`);
  }
} else {
  for (const url of new Set([...oldUrls, ...redirects.map((r) => r.source)])) {
    try {
      const res = await fetch(base + url, { redirect: 'manual' });
      if (res.status === 200) {
        ok++;
        continue;
      }
      if (![301, 302, 308].includes(res.status)) {
        errors.push(`${url}: status ${res.status}`);
        continue;
      }
      const location = new URL(res.headers.get('location') ?? '', base + url).href;
      const final = await fetch(location, { redirect: 'manual' });
      if (final.status !== 200) errors.push(`${url} → ${location}: cilj vrne ${final.status}`);
      else if (res.status === 308) errors.push(`${url}: 308 namesto 301/302`);
      else ok++;
    } catch (e) {
      errors.push(`${url}: ${e.message}`);
    }
  }
}

console.log(`\nPreusmeritve${base ? ` (${base})` : ''}: ${ok} v redu, ${errors.length} napak.`);
for (const e of errors) console.log(`  ✗ ${e}`);
process.exit(errors.length ? 1 : 0);
