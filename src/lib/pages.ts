import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';

export type PageEntry = CollectionEntry<'pages'>;

/** Jezik strani iz poti datoteke: content/pages/<jezik>/<ime>.md */
export function pageLocale(entry: PageEntry): Locale {
  return entry.id.startsWith('en/') ? 'en' : 'sl';
}

/** Vrne objavljeno stran za jezik in translationKey ali vrže napako. */
export async function getPage(locale: Locale, translationKey: string): Promise<PageEntry> {
  const all = await getCollection('pages', (e) => pageLocale(e) === locale && !e.data.draft);
  const page = all.find((e) => e.data.translationKey === translationKey);
  if (!page) throw new Error(`Manjka stran "${translationKey}" v jeziku ${locale} (content/pages/${locale}/).`);
  return page;
}
