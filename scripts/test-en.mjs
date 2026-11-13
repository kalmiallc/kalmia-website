#!/usr/bin/env node
/**
 * Merilo sprejema iz SPEC (razdelek 10): dodajanje ene datoteke content/pages/en/storitve.md
 * brez sprememb kode ustvari /en/services s pravilnim hreflang.
 *
 * Test začasno kopira scripts/fixtures/en-storitve.md v content/pages/en/storitve.md,
 * zgradi stran v ločeno mapo (.test-en/), preveri rezultat in datoteko ter mapo odstrani.
 * Če EN različica že obstaja, test ne naredi ničesar.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const target = join(ROOT, 'content/pages/en/storitve.md');
const out = join(ROOT, '.test-en');
if (existsSync(target)) {
  console.log('content/pages/en/storitve.md že obstaja, test ni potreben.');
  process.exit(0);
}
const createdDir = !existsSync(join(ROOT, 'content/pages/en'));
const errors = [];
try {
  mkdirSync(join(ROOT, 'content/pages/en'), { recursive: true });
  copyFileSync(join(ROOT, 'scripts/fixtures/en-storitve.md'), target);
  execFileSync('npx', ['astro', 'build', '--outDir', out], { cwd: ROOT, stdio: 'ignore' });
  const read = (p) => (existsSync(join(out, p)) ? readFileSync(join(out, p), 'utf8') : null);
  const en = read('en/services.html');
  const sl = read('storitve.html');
  const sitemap = read('sitemap.xml') ?? '';
  if (!en) errors.push('/en/services ni zgrajena');
  else {
    if (!en.includes('<html lang="en"')) errors.push('/en/services nima lang="en"');
    if (!en.includes('hreflang="sl" href="https://kalmia.si/storitve"')) errors.push('/en/services nima hreflang sl');
    if (!en.includes('hreflang="x-default" href="https://kalmia.si/storitve"')) errors.push('/en/services nima x-default');
    if (!en.includes('og:locale" content="en_US"')) errors.push('/en/services nima og:locale en_US');
  }
  if (!sl?.includes('hreflang="en" href="https://kalmia.si/en/services"')) errors.push('/storitve nima hreflang en');
  if (!sitemap.includes('<loc>https://kalmia.si/en/services</loc>')) errors.push('sitemap nima /en/services');
  if (!sitemap.includes('hreflang="en" href="https://kalmia.si/en/services"')) errors.push('sitemap nima alternative en');
} catch (e) {
  errors.push(`build: ${e.message.split('\n')[0]}`);
} finally {
  rmSync(target, { force: true });
  if (createdDir) rmSync(join(ROOT, 'content/pages/en'), { recursive: true, force: true });
  rmSync(out, { recursive: true, force: true });
}
console.log(errors.length ? `EN struktura: ${errors.length} napak\n  ✗ ${errors.join('\n  ✗ ')}` : 'EN struktura: /en/services se zgradi s pravilnim hreflang in v sitemapu.');
process.exit(errors.length ? 1 : 0);
