#!/usr/bin/env node
/**
 * Preverjanje zgrajene strani (dist/) po pravilih iz CLAUDE.md in SPEC.md.
 * Zaženi po `astro build`: `npm run check`.
 *
 * Napake (izhodna koda 1):
 *  - stran nima natanko enega H1, manjka <title>, meta opis ali canonical,
 *  - slika brez atributa alt,
 *  - notranja povezava na neobstoječo stran ali sidro,
 *  - zunanja povezava v novem zavihku brez rel="noopener",
 *  - preskok v hierarhiji naslovov (npr. H2 → H4),
 *  - statusna oznaka iz prototipa, obrazec ali znesek v evrih (razen na straneh EU projektov).
 * Opozorila: predolg title (> 60) ali opis (> 155), pomišljaj v besedilu.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const PENDING_FILE = new URL('./pending-routes.json', import.meta.url).pathname;
const pending = existsSync(PENDING_FILE) ? JSON.parse(readFileSync(PENDING_FILE, 'utf8')).routes ?? [] : [];

const STATUS_LABELS = ['ZA PREGLED', 'PREDELATI', 'DOPOLNITI', 'ZA PREDEBATIRAT', 'PREDELAJ VSEBINO'];

if (!existsSync(DIST)) {
  console.error('Mapa dist/ ne obstaja. Najprej zaženi `npm run build`.');
  process.exit(1);
}

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const existing = new Set(files.map((f) => '/' + relative(DIST, f)));

/** Pot v URL → ali obstaja zgrajena datoteka. */
function routeExists(pathname) {
  const p = decodeURIComponent(pathname);
  if (p === '/' || p === '') return existing.has('/index.html');
  const clean = p.replace(/\/+$/, '');
  return existing.has(clean) || existing.has(`${clean}.html`) || existing.has(`${clean}/index.html`);
}

/** Pot zgrajene datoteke → URL pot. */
function urlOf(file) {
  const rel = '/' + relative(DIST, file);
  return rel.replace(/\/index\.html$/, '/').replace(/\.html$/, '') || '/';
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : null;
};
const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
const textOf = (html) =>
  decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();

let errors = 0;
let warnings = 0;
const pageIds = new Map();

// Najprej zberi id-je vseh strani (za preverjanje sider).
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((m) => m[1]));
  pageIds.set(urlOf(file), ids);
}

for (const file of htmlFiles) {
  const url = urlOf(file);
  const html = readFileSync(file, 'utf8');
  const problems = [];
  const notes = [];
  const err = (msg) => problems.push(msg);
  const warn = (msg) => notes.push(msg);

  // Brez HTML strani, ki so le preusmeritve (Astro meta refresh).
  if (/<meta http-equiv="refresh"/i.test(html)) continue;

  const lang = html.match(/<html[^>]*\slang="([^"]+)"/i);
  if (!lang) err('manjka <html lang>');

  const title = html.match(/<title>([\s\S]*?)<\/title>/i);
  const titleText = title ? decode(title[1]).trim() : '';
  if (!titleText) err('manjka <title>');
  else if ([...titleText].length > 60) warn(`title je daljši od 60 znakov (${[...titleText].length})`);

  const descTag = html.match(/<meta[^>]+name="description"[^>]*>/i);
  const desc = descTag ? decode(attr(descTag[0], 'content') ?? '').trim() : '';
  if (!desc) err('manjka meta opis');
  else if ([...desc].length > 155) warn(`meta opis je daljši od 155 znakov (${[...desc].length})`);

  if (!/<link[^>]+rel="canonical"[^>]+href="https:\/\/kalmia\.si[^"]*"/i.test(html)) err('manjka canonical na https://kalmia.si');

  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) err(`število H1 je ${h1Count}, mora biti 1`);

  // Hierarhija naslovov brez preskakovanja.
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])[\s>]/gi)) {
    const level = Number(m[1]);
    if (prev && level > prev + 1) err(`preskok naslova H${prev} → H${level}`);
    prev = level;
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (attr(m[0], 'alt') === null) err(`slika brez alt: ${attr(m[0], 'src')}`);
  }

  for (const m of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = m[0];
    const href = attr(tag, 'href');
    if (href === null) continue;
    if (attr(tag, 'target') === '_blank' && !/noopener/.test(attr(tag, 'rel') ?? '')) {
      err(`povezava v novem zavihku brez rel="noopener": ${href}`);
    }
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;
    const [pathPart, hash] = href.split('#');
    const target = pathPart === '' ? url : pathPart;
    if (pathPart !== '' && !target.startsWith('/')) {
      err(`relativna povezava (uporabi absolutno pot): ${href}`);
      continue;
    }
    if (!routeExists(target)) {
      if (pending.includes(target.replace(/\/+$/, '') || '/')) continue;
      err(`povezava na neobstoječo stran: ${href}`);
      continue;
    }
    if (hash) {
      const ids = pageIds.get(target.replace(/\/+$/, '') || '/') ?? pageIds.get(target);
      if (ids && !ids.has(hash)) err(`sidro ne obstaja: ${href}`);
    }
  }

  if (/<form[\s>]/i.test(html)) err('stran vsebuje obrazec');

  const text = textOf(html);
  // Statusna oznaka je element, katerega celotno besedilo je oznaka (velike črke ureja CSS).
  for (const label of STATUS_LABELS) {
    if (new RegExp(`>\\s*${label}\\s*<`, 'iu').test(html)) err(`statusna oznaka iz prototipa: ${label}`);
  }
  // Izjema: strani EU projektov navajajo vrednost in sofinanciranje (obvezno obveščanje javnosti).
  const isEuProject = /^\/(en\/projects|projekti)\//.test(url);
  if (!isEuProject && /(€\s?\d|\d\s?€|\d\s?EUR\b)/.test(text)) err('stran vsebuje znesek');
  const dash = text.match(/.{0,30}\s[—–]\s.{0,30}/);
  if (dash) warn(`pomišljaj v besedilu: »${dash[0].trim()}«`);

  if (problems.length || notes.length) {
    console.log(`\n${url}`);
    for (const p of problems) console.log(`  ✗ ${p}`);
    for (const n of notes) console.log(`  ! ${n}`);
  }
  errors += problems.length;
  warnings += notes.length;
}

console.log(`\nPreverjenih strani: ${htmlFiles.length}. Napake: ${errors}. Opozorila: ${warnings}.`);
if (pending.length) console.log(`Načrtovane poti (še niso zgrajene): ${pending.length}, glej scripts/pending-routes.json.`);
process.exit(errors ? 1 : 0);
