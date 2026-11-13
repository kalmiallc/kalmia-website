/**
 * Branje vsebine iz zbirk in navzkrižno preverjanje povezav med datotekami.
 * validateContent() teče ob vsakem buildu; ob napaki se build ustavi z opisom,
 * katero datoteko je treba popraviti.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { existsSync } from 'node:fs';
import { LOCALES, homePath, normalizePath, type Locale } from './i18n';
import navigation from '../../content/navigation.json';
import sl from '../../content/i18n/sl.json';
import en from '../../content/i18n/en.json';

export type PageEntry = CollectionEntry<'pages'>;
export type PageData = PageEntry['data'];
export type CaseEntry = CollectionEntry<'cases'>;

/** Jezik iz poti datoteke: content/<zbirka>/<jezik>/<ime>.md */
export function entryLocale(entry: { id: string }): Locale {
  return entry.id.startsWith('en/') ? 'en' : 'sl';
}

/** Vse strani v jeziku (tudi tiste z draft: true, ki se zgradijo z noindex). */
export async function getPages(locale: Locale): Promise<PageEntry[]> {
  return getCollection('pages', (e) => entryLocale(e) === locale);
}

/** Stran po translationKey ali napaka. */
export async function getPage(locale: Locale, key: string): Promise<PageEntry> {
  const page = (await getPages(locale)).find((e) => e.data.translationKey === key);
  if (!page) throw new Error(`Manjka stran "${key}" v content/pages/${locale}/.`);
  return page;
}

/** Pot strani za jezik: "/" + slug, za EN z predpono "/en". */
export function pathForSlug(locale: Locale, slug: string): string {
  const base = homePath(locale);
  return normalizePath(slug ? `${base === '/' ? '' : base}/${slug}` : base);
}

/** Pot strani po translationKey, z neobveznim sidrom. */
export async function pagePath(locale: Locale, key: string, anchor?: string): Promise<string> {
  const page = await getPage(locale, key);
  const path = pathForSlug(locale, page.data.slug);
  return anchor ? `${path}#${anchor}` : path;
}

/* ---------- Ploščice storitev ---------- */

export interface Tile {
  code: string;
  title: string;
  description: string;
  href: string | null;
}

/** Ploščice skupine za stran, z upoštevanimi odstopanji (onPages) in razrešenimi povezavami. */
export async function getTiles(locale: Locale, pageKey: string, group: string): Promise<Tile[]> {
  const all = await getCollection('services', (e) => e.data.group === group);
  const sorted = all.sort((a, b) => a.data.order - b.data.order);
  const tiles: Tile[] = [];
  for (const { data } of sorted) {
    const base = data[locale];
    if (!base) continue;
    const override = data.onPages?.[pageKey];
    const text = { ...base, ...(override?.[locale] ?? {}) };
    const link = override && 'link' in override ? override.link : data.link;
    tiles.push({
      code: data.code,
      title: text.title,
      description: text.description,
      href: link ? await pagePath(locale, link.page, link.anchor) : null,
    });
  }
  return tiles;
}

/* ---------- Reference ---------- */

export type CasePage = 'reference' | 'proizvodnja';

/** Objavljene reference za stran, v vrstnem redu za to stran. */
export async function getCases(locale: Locale, page: CasePage): Promise<CaseEntry[]> {
  const all = await getCollection(
    'cases',
    (e) => entryLocale(e) === locale && !e.data.hidden && !e.data.draft && e.data.showOn.includes(page)
  );
  const orderOf = (e: CaseEntry) => e.data.orderOn?.[page] ?? e.data.order;
  return all.sort((a, b) => orderOf(a) - orderOf(b));
}

/** Vse reference, ki dobijo podstran (niso skrite in niso osnutek). */
export async function getPublishedCases(locale: Locale): Promise<CaseEntry[]> {
  const all = await getCollection('cases', (e) => entryLocale(e) === locale && !e.data.hidden && !e.data.draft);
  return all.sort((a, b) => a.data.order - b.data.order);
}

/* ---------- FAQ in viri ---------- */

export async function getFaq(locale: Locale, key: string) {
  const all = await getCollection('faq');
  const entry = all.find((e) => e.id === `${key}.${locale}`);
  if (!entry) throw new Error(`Manjka content/faq/${key}.${locale}.json.`);
  return entry.data;
}

export async function getSources(locale: Locale, key: string) {
  const all = await getCollection('sources');
  const entry = all.find((e) => e.id === key);
  const list = entry?.data[locale];
  if (!list) throw new Error(`Manjkajo viri "${key}" za jezik ${locale} (content/sources/${key}.json).`);
  return list.items;
}

/* ---------- Navzkrižno preverjanje ---------- */

/** Vse ključe strani, na katere se sklicuje stran. */
function referencedPages(d: PageData): string[] {
  const refs: string[] = [];
  switch (d.template) {
    case 'storitve':
      refs.push(...(d.hero.deeper?.links.map((l) => l.page) ?? []));
      break;
    case 'vodnik':
      refs.push(...d.next.pages);
      for (const p of d.steps.phases) for (const c of p.cards) if (c.link) refs.push(c.link.page);
      break;
    case 'ekipe':
      refs.push(d.afterPilot.link.page);
      break;
    case 'proizvodnja':
    case 'reference':
      refs.push(d.next.page, 'reference');
      break;
  }
  return refs;
}

function keysOf(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => keysOf(v, prefix ? `${prefix}.${k}` : k));
}

let validation: Promise<void> | undefined;

/** Preveri, da se vse povezave med vsebinskimi datotekami ujemajo. Teče enkrat na build. */
export function validateContent(): Promise<void> {
  validation ??= (async () => {
    const errors: string[] = [];

    // Besedila vmesnika: EN mora imeti iste ključe kot SL.
    const slKeys = keysOf(sl).sort().join();
    const enKeys = keysOf(en).sort().join();
    if (slKeys !== enKeys) errors.push('content/i18n/en.json nima istih ključev kot sl.json.');

    const faqIds = new Set((await getCollection('faq')).map((e) => e.id));
    const sourceIds = new Set((await getCollection('sources')).map((e) => e.id));
    const groups = new Set((await getCollection('services')).map((e) => e.data.group));

    for (const locale of LOCALES) {
      const pages = await getPages(locale);
      const keys = new Set<string>();
      const slugs = new Set<string>();
      for (const p of pages) {
        const where = `content/pages/${p.id}.md`;
        if (keys.has(p.data.translationKey)) errors.push(`${where}: podvojen translationKey "${p.data.translationKey}".`);
        if (slugs.has(p.data.slug)) errors.push(`${where}: podvojen slug "${p.data.slug}".`);
        keys.add(p.data.translationKey);
        slugs.add(p.data.slug);
      }
      for (const p of pages) {
        const d = p.data;
        const where = `content/pages/${p.id}.md`;
        for (const ref of referencedPages(d)) {
          if (!keys.has(ref)) errors.push(`${where}: povezava na neobstoječo stran "${ref}".`);
        }
        if ('faq' in d && !faqIds.has(`${d.faq}.${locale}`)) errors.push(`${where}: manjka content/faq/${d.faq}.${locale}.json.`);
        if (d.template === 'vodnik' && !sourceIds.has(d.sources.key)) errors.push(`${where}: manjka content/sources/${d.sources.key}.json.`);
        if (d.template === 'storitve') for (const g of d.groups) if (!groups.has(g.group)) errors.push(`${where}: ni ploščic skupine "${g.group}".`);
        if (d.template === 'ekipe' && !groups.has(d.forms.group)) errors.push(`${where}: ni ploščic skupine "${d.forms.group}".`);
      }

      // Kazalo: vsaka vrstica mora imeti stran z enako potjo.
      for (const row of navigation.index) {
        const entry = (row as Record<string, unknown>)[locale] as { path: string } | undefined;
        if (!entry) continue;
        const page = pages.find((p) => p.data.translationKey === row.key);
        if (!page) errors.push(`content/navigation.json: vrstica "${row.key}" (${locale}) nima strani v content/pages/${locale}/.`);
        else if (normalizePath(entry.path) !== pathForSlug(locale, page.data.slug))
          errors.push(`content/navigation.json: pot "${entry.path}" se ne ujema s slugom strani "${page.data.slug}".`);
      }

      // Ploščice: povezave na obstoječe strani.
      for (const s of await getCollection('services')) {
        if (!s.data[locale]) continue;
        const links = [s.data.link, ...Object.values(s.data.onPages ?? {}).map((o) => o.link)];
        for (const l of links) if (l && !keys.has(l.page)) errors.push(`content/services/${s.id}.json: povezava na neobstoječo stran "${l.page}".`);
      }

      // Reference: unikatni slugi, vrstni red za proizvodnjo.
      const cases = await getCollection('cases', (e) => entryLocale(e) === locale);
      const caseSlugs = new Set<string>();
      for (const c of cases) {
        const where = `content/cases/${c.id}.md`;
        if (caseSlugs.has(c.data.slug)) errors.push(`${where}: podvojen slug "${c.data.slug}".`);
        caseSlugs.add(c.data.slug);
        if (c.data.showOn.includes('proizvodnja') && !c.data.orderOn?.proizvodnja)
          errors.push(`${where}: showOn vsebuje "proizvodnja", manjka orderOn.proizvodnja.`);
      }
    }

    // EU projekti: logotipi financerjev morajo obstajati v /public.
    for (const p of await getCollection('projects')) {
      for (const logo of p.data.logos) {
        if (!existsSync(`${process.cwd()}/public${logo.src}`))
          errors.push(`content/projects/${p.id}.md: manjka slika public${logo.src}.`);
      }
    }

    if (errors.length) throw new Error(`Napake v vsebini:\n- ${errors.join('\n- ')}`);
  })();
  return validation;
}
