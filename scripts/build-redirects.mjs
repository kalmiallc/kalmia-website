#!/usr/bin/env node
/**
 * Zgradi vercel.json: preusmeritve iz content/redirects.json in iz polj legacyUrl
 * (blog, EU projekti, pravna besedila) ter varnostne glave.
 *
 * Lokalno (npm run build) datoteko zapiše; spremembo commitajte.
 * Z --check (npm run check) preveri, da je vercel.json posodobljen, sicer napaka.
 * Na Vercelu (VERCEL=1) le izpiše opozorilo: Vercel bere vercel.json pred buildom,
 * zato mora biti posodobljen že v repozitoriju (to zagotovi npm run check).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Datoteke v mapi, razvrščene (vrstni red datotečnega sistema se med okolji razlikuje). */
const ls = (dir) => readdirSync(dir).sort();

const ROOT = new URL('..', import.meta.url).pathname;
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const field = (text, name) => text.match(new RegExp(`^${name}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))?.[1];
const frontmatter = (text) => text.split(/^---\s*$/m)[1] ?? '';

/** Pot seznama (npr. "blog") za jezik iz content/pages/<jezik>/*.md s predlogo. */
function listSlug(locale, template) {
  const dir = join(ROOT, 'content/pages', locale);
  if (!existsSync(dir)) return null;
  for (const f of ls(dir)) {
    const fm = frontmatter(readFileSync(join(dir, f), 'utf8'));
    if (field(fm, 'template') === template) return field(fm, 'slug');
  }
  return null;
}

const prefix = (locale) => (locale === 'sl' ? '' : `/${locale}`);
const rules = [];
const add = (source, destination, statusCode, origin) => rules.push({ source, destination, statusCode, origin });

// 1) Ročno vpisane preusmeritve
for (const r of JSON.parse(read('content/redirects.json')).redirects) add(r.from, r.to, r.status, 'content/redirects.json');

// 2) legacyUrl iz blog zapisov in EU projektov (301 na novo pot)
for (const [collection, template] of [
  ['blog', 'blog'],
  ['projects', 'projekti'],
]) {
  const base = join(ROOT, 'content', collection);
  if (!existsSync(base)) continue;
  for (const locale of ls(base)) {
    const list = listSlug(locale, template);
    if (!list) continue;
    for (const f of ls(join(base, locale)).filter((x) => x.endsWith('.md'))) {
      const fm = frontmatter(readFileSync(join(base, locale, f), 'utf8'));
      const legacy = field(fm, 'legacyUrl');
      if (!legacy || /^draft:\s*true/m.test(fm)) continue;
      const slug = collection === 'blog' ? f.replace(/\.md$/, '') : field(fm, 'slug');
      add(legacy, `${prefix(locale)}/${list}/${slug}`, 301, `content/${collection}/${locale}/${f}`);
    }
  }
}

// 3) legacyUrl iz pravnih besedil
for (const f of ls(join(ROOT, 'content/legal')).filter((x) => x.endsWith('.md'))) {
  const fm = frontmatter(read(`content/legal/${f}`));
  const legacy = field(fm, 'legacyUrl');
  if (legacy) add(legacy, `/${field(fm, 'slug')}`, 301, `content/legal/${f}`);
}

// Odstrani podvojene vire (prvi ima prednost), preveri protislovja in verige
const bySource = new Map();
const errors = [];
for (const r of rules) {
  const prev = bySource.get(r.source);
  if (!prev) bySource.set(r.source, r);
  else if (prev.destination !== r.destination)
    errors.push(`${r.source}: ${prev.origin} → ${prev.destination}, ${r.origin} → ${r.destination}`);
}
for (const r of bySource.values()) {
  if (r.source === r.destination) errors.push(`${r.source} preusmeri sam nase (${r.origin})`);
  if (bySource.has(r.destination)) errors.push(`veriga preusmeritev: ${r.source} → ${r.destination} → ${bySource.get(r.destination).destination}`);
  if (![301, 302].includes(r.statusCode)) errors.push(`${r.source}: status mora biti 301 ali 302 (${r.origin})`);
}
if (errors.length) {
  console.error(`Napake v preusmeritvah:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  // script-src in style-src z zgoščenimi vrednostmi doda Astro v <meta> vsake strani (astro.config.mjs → security.csp).
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'none'; object-src 'none'" },
];

const config = {
  $schema: 'https://openapi.vercel.sh/vercel.json',
  framework: 'astro',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  cleanUrls: true,
  trailingSlash: false,
  redirects: [...bySource.values()].map(({ source, destination, statusCode }) => ({ source, destination, statusCode })),
  headers: [
    { source: '/(.*)', headers: securityHeaders },
    { source: '/(.*)', missing: [{ type: 'host', value: 'kalmia.si' }], headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
    { source: '/_astro/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    { source: '/images/(.*)', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] },
  ],
};

const out = JSON.stringify(config, null, 2) + '\n';
const current = existsSync(join(ROOT, 'vercel.json')) ? read('vercel.json') : '';
const checkOnly = process.argv.includes('--check');
if (process.env.VERCEL === '1' && !checkOnly) {
  if (current !== out) console.warn('Opozorilo: vercel.json v repozitoriju ni posodobljen. Zaženite lokalno `npm run build` in commitajte vercel.json.');
  else console.log(`vercel.json je posodobljen (${config.redirects.length} preusmeritev).`);
} else if (checkOnly) {
  if (current !== out) {
    console.error('vercel.json ni posodobljen s content/redirects.json in legacyUrl. Zaženite lokalno `npm run build` in commitajte vercel.json.');
    const a = current.split('\n');
    const b = out.split('\n');
    const i = a.findIndex((line, n) => line !== b[n]);
    console.error(`Prva razlika v vrstici ${i + 1}:\n  v repozitoriju: ${a[i]}\n  pričakovano:    ${b[i]}`);
    process.exit(1);
  }
  console.log(`vercel.json je posodobljen (${config.redirects.length} preusmeritev).`);
} else {
  if (current !== out) writeFileSync(join(ROOT, 'vercel.json'), out);
  console.log(`vercel.json: ${config.redirects.length} preusmeritev${current !== out ? ' (posodobljeno)' : ''}.`);
}
