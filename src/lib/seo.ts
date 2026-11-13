/**
 * SEO in GEO: jezikovne različice (hreflang), strukturirani podatki (JSON-LD) in
 * seznam vseh objavljenih poti za sitemap, llms.txt in preverjanje.
 * Vsa dejstva o podjetju so iz content/site.json, da so povsod enaka.
 */
import { LOCALES, DEFAULT_LOCALE, homePath, normalizePath, type Locale } from './i18n';
import { routesFor, type Route } from './routes';
import { site } from './site';

/* ---------- Poti in jezikovne različice ---------- */

export interface PublishedRoute {
  locale: Locale;
  path: string;
  route: Route;
  /** Ključ za povezavo jezikovnih različic, npr. "page:storitve". */
  key: string;
}

export function routePath(locale: Locale, slug: string | undefined): string {
  const base = homePath(locale);
  if (!slug) return base;
  return normalizePath(`${base === '/' ? '' : base}/${slug}`);
}

let allRoutes: Promise<PublishedRoute[]> | undefined;

/** Vse zgrajene poti v vseh jezikih (brez 404). */
export function publishedRoutes(): Promise<PublishedRoute[]> {
  allRoutes ??= (async () => {
    const out: PublishedRoute[] = [];
    for (const locale of LOCALES) {
      for (const route of await routesFor(locale)) {
        const p = route.props;
        out.push({
          locale,
          path: routePath(locale, route.params.slug),
          route,
          key: `${p.kind}:${p.entry.data.translationKey}`,
        });
      }
    }
    return out;
  })();
  return allRoutes;
}

/**
 * Jezikovne različice strani (absolutni URL-ji). Vrne samo jezike, v katerih stran obstaja.
 * hreflang se izpiše le, če obstajata vsaj dve različici.
 */
export async function alternatesFor(key: string): Promise<Partial<Record<Locale, string>>> {
  const routes = await publishedRoutes();
  const out: Partial<Record<Locale, string>> = {};
  for (const r of routes) if (r.key === key) out[r.locale] = absoluteUrl(r.path);
  return out;
}

export function absoluteUrl(path: string): string {
  return new URL(normalizePath(path), site.url).href;
}

/* ---------- JSON-LD ---------- */

type Json = Record<string, unknown>;

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

const postalAddress = () => ({
  '@type': 'PostalAddress',
  streetAddress: site.address.street,
  postalCode: site.address.postalCode,
  addressLocality: site.address.city,
  addressCountry: site.address.country,
});

export function organizationLd(): Json {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: { '@type': 'ImageObject', url: absoluteUrl(site.logo) },
    description: site.description,
    email: site.email,
    vatID: site.vatId,
    address: postalAddress(),
    areaServed: { '@type': 'Country', name: site.areaServed },
    knowsAbout: site.industries,
    sameAs: [site.linkedin],
  };
}

export function websiteLd(locale: Locale): Json {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl(homePath(locale)),
    name: 'Kalmia',
    inLanguage: locale,
    publisher: { '@id': ORG_ID },
  };
}

/** Domača stran: Kalmia kot strokovna storitev s sedežem v Škofji Loki. */
export function professionalServiceLd(): Json {
  return {
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#professional-service`,
    name: site.name,
    url: site.url,
    image: absoluteUrl(site.ogImage),
    logo: absoluteUrl(site.logo),
    description: site.description,
    email: site.email,
    address: postalAddress(),
    areaServed: { '@type': 'Country', name: site.areaServed },
    parentOrganization: { '@id': ORG_ID },
    sameAs: [site.linkedin],
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]): Json {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function serviceLd(s: { name: string; description: string; url: string; category?: string }): Json {
  return {
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: s.url,
    ...(s.category ? { category: s.category } : {}),
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: site.areaServed },
  };
}

export function faqLd(items: { q: string; a: string }[]): Json {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

export function articleLd(a: {
  type?: 'Article' | 'BlogPosting';
  headline: string;
  description: string;
  url: string;
  locale: Locale;
  datePublished?: Date;
  dateModified?: Date;
  image?: string;
  author?: string;
  about?: Json;
}): Json {
  const author =
    !a.author || a.author === 'Kalmia' || a.author === site.name
      ? { '@id': ORG_ID }
      : { '@type': 'Person', name: a.author, worksFor: { '@id': ORG_ID } };
  return {
    '@type': a.type ?? 'Article',
    headline: a.headline,
    description: a.description,
    url: a.url,
    mainEntityOfPage: a.url,
    inLanguage: a.locale,
    image: absoluteUrl(a.image ?? site.ogImage),
    ...(a.datePublished ? { datePublished: a.datePublished.toISOString().slice(0, 10) } : {}),
    ...(a.datePublished || a.dateModified
      ? { dateModified: (a.dateModified ?? a.datePublished)!.toISOString().slice(0, 10) }
      : {}),
    author,
    publisher: { '@id': ORG_ID },
    ...(a.about ? { about: a.about } : {}),
  };
}

/** Vse JSON-LD vozlišča strani v enem grafu. */
export function graph(nodes: Json[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}

export { DEFAULT_LOCALE };
