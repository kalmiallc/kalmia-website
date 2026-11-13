/**
 * /llms.txt: kdo je Kalmia, kaj ponuja, za koga in kje, ter seznam ključnih strani.
 * Generirano iz content/site.json, content/navigation.json in vsebine strani.
 */
import type { APIRoute } from 'astro';
import { companyFacts } from '@lib/llms';
import { indexRows } from '@lib/navigation';
import { absoluteUrl, publishedRoutes } from '@lib/seo';
import { site } from '@lib/site';

export const GET: APIRoute = async () => {
  const locale = 'sl';
  const routes = (await publishedRoutes()).filter((r) => r.locale === locale);
  const of = (kind: string) => routes.filter((r) => r.route.props.kind === kind);
  const line = (title: string, path: string, desc?: string) => `- [${title}](${absoluteUrl(path)})${desc ? `: ${desc}` : ''}`;
  const data = (r: (typeof routes)[number]) => r.route.props.entry.data as { title: string; description?: string; breadcrumb?: string; h1?: string };

  const pages = of('page');
  const pageByKey = (key: string) => pages.find((p) => data(p) && (p.route.props.entry.data as { translationKey: string }).translationKey === key);

  const sections = [
    '# Kalmia',
    companyFacts(),
    '## Ključne strani',
    [
      line('Domača stran', '/', site.description),
      ...indexRows(locale).map((r) => line(r.title, r.path, r.description)),
    ].join('\n'),
    '## Reference',
    of('case').map((r) => line(data(r).title, r.path, data(r).description)).join('\n'),
    '## Blog',
    of('post').map((r) => line(data(r).title, r.path, data(r).description)).join('\n'),
    '## EU projekti',
    [
      ...(pageByKey('projekti') ? [line('EU projekti', pageByKey('projekti')!.path, data(pageByKey('projekti')!).description)] : []),
      ...of('project').map((r) => line(data(r).title, r.path, data(r).description)),
    ].join('\n'),
    '## Optional',
    [
      line('Celotna besedila ključnih strani', '/llms-full.txt'),
      ...of('legal').map((r) => line(data(r).h1 ?? data(r).title, r.path, data(r).description)),
    ].join('\n'),
  ];
  return new Response(sections.join('\n\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
