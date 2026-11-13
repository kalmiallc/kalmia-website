/**
 * Vse poti za jezik. Isto logiko uporabljata src/pages/[...slug].astro (SL) in
 * src/pages/en/[...slug].astro (EN), zato nova datoteka v content/<zbirka>/en/
 * ustvari angleško stran brez spremembe kode.
 *
 * Poti podstrani (reference, projekti) izhajajo iz sluga strani s seznamom:
 * SL /reference/<slug>, EN /<slug strani s seznamom>/<slug>.
 */
import { getCollection } from 'astro:content';
import { entryLocale, getPages, type CaseEntry, type PageEntry } from './content';
import type { Locale } from './i18n';
import type { CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;
export type LegalEntry = CollectionEntry<'legal'>;
export type BlogEntry = CollectionEntry<'blog'>;

export type RouteProps =
  | { kind: 'page'; locale: Locale; entry: PageEntry }
  | { kind: 'case'; locale: Locale; entry: CaseEntry; listPage: PageEntry }
  | { kind: 'project'; locale: Locale; entry: ProjectEntry; listPage: PageEntry }
  | { kind: 'legal'; locale: Locale; entry: LegalEntry }
  | { kind: 'post'; locale: Locale; entry: BlogEntry; listPage: PageEntry };

export interface Route {
  params: { slug: string | undefined };
  props: RouteProps;
}

const published = <T extends { data: { draft?: boolean } }>(e: T) => !e.data.draft;

export async function routesFor(locale: Locale): Promise<Route[]> {
  const pages = (await getPages(locale)).filter(published);
  const routes: Route[] = pages.map((entry) => ({
    params: { slug: entry.data.slug || undefined },
    props: { kind: 'page', locale, entry },
  }));

  const casesList = pages.find((p) => p.data.template === 'reference');
  if (casesList) {
    const cases = await getCollection(
      'cases',
      (e) => entryLocale(e) === locale && !e.data.hidden && !e.data.draft
    );
    for (const entry of cases.sort((a, b) => a.data.order - b.data.order)) {
      routes.push({
        params: { slug: `${casesList.data.slug}/${entry.data.slug}` },
        props: { kind: 'case', locale, entry, listPage: casesList },
      });
    }
  }

  const projectsList = pages.find((p) => p.data.template === 'projekti');
  if (projectsList) {
    const projects = await getCollection('projects', (e) => entryLocale(e) === locale && !e.data.draft);
    for (const entry of projects) {
      routes.push({
        params: { slug: `${projectsList.data.slug}/${entry.data.slug}` },
        props: { kind: 'project', locale, entry, listPage: projectsList },
      });
    }
  }

  const blogList = pages.find((p) => p.data.template === 'blog');
  if (blogList) {
    for (const entry of await getPosts(locale)) {
      routes.push({
        params: { slug: `${blogList.data.slug}/${postSlug(entry)}` },
        props: { kind: 'post', locale, entry, listPage: blogList },
      });
    }
  }

  const legal = await getCollection('legal', (e) => entryLocale(e) === locale);
  for (const entry of legal) {
    routes.push({ params: { slug: entry.data.slug }, props: { kind: 'legal', locale, entry } });
  }

  return routes;
}

/** Pot podstrani reference za jezik. */
export async function casePath(locale: Locale, caseSlug: string): Promise<string | null> {
  const list = (await getPages(locale)).find((p) => p.data.template === 'reference' && !p.data.draft);
  if (!list) return null;
  return `${locale === 'en' ? '/en' : ''}/${list.data.slug}/${caseSlug}`;
}

/** Slug zapisa je ime datoteke (content/blog/<jezik>/<slug>.md). */
export function postSlug(entry: BlogEntry): string {
  return entry.id.split('/').pop()!;
}

/** Objavljeni zapisi za jezik, najnovejši prvi. */
export async function getPosts(locale: Locale): Promise<BlogEntry[]> {
  const all = await getCollection('blog', (e) => entryLocale(e) === locale && !e.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
