/**
 * sitemap.xml: vse objavljene strani v vseh jezikih, z lastmod in jezikovnimi
 * različicami (xhtml:link). Strani z noindex (404) niso vključene.
 */
import type { APIRoute } from 'astro';
import { LOCALES } from '@lib/i18n';
import { publishedRoutes, absoluteUrl } from '@lib/seo';
import { lastmodFor } from '@lib/lastmod';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export const GET: APIRoute = async () => {
  const routes = await publishedRoutes();
  const byKey = new Map<string, typeof routes>();
  for (const r of routes) byKey.set(r.key, [...(byKey.get(r.key) ?? []), r]);

  const urls = routes.map((r) => {
    const versions = byKey.get(r.key) ?? [];
    const lastmod = lastmodFor(r.route);
    const alternates =
      versions.length > 1
        ? [
            ...LOCALES.flatMap((l) => versions.filter((v) => v.locale === l)).map(
              (v) => `    <xhtml:link rel="alternate" hreflang="${v.locale}" href="${esc(absoluteUrl(v.path))}"/>`
            ),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl((versions.find((v) => v.locale === 'sl') ?? versions[0]!).path))}"/>`,
          ]
        : [];
    return [
      '  <url>',
      `    <loc>${esc(absoluteUrl(r.path))}</loc>`,
      ...(lastmod ? [`    <lastmod>${lastmod.toISOString().slice(0, 10)}</lastmod>`] : []),
      ...alternates,
      '  </url>',
    ].join('\n');
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
