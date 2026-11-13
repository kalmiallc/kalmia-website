/**
 * Besedila za /llms.txt in /llms-full.txt (vidnost v AI modelih).
 * Vse je generirano iz /content, zato je vedno usklajeno s stranjo.
 */
import { getCases, getFaq, getPage, getSources, getTiles, pagePath, type PageEntry } from './content';
import { absoluteUrl } from './seo';
import { plain } from './format';
import { indexRows } from './navigation';
import { site } from './site';
import type { Locale } from './i18n';

const url = async (locale: Locale, key: string, anchor?: string) => absoluteUrl(await pagePath(locale, key, anchor));
const list = (items: string[]) => items.map((x) => `- ${x}`).join('\n');
const titled = (items: { title: string; text: string }[]) => items.map((x) => `- **${x.title}**: ${x.text}`).join('\n');

/** Kratek opis podjetja, enak v llms.txt in llms-full.txt. */
export function companyFacts(): string {
  const a = site.address;
  return [
    `> ${site.description}`,
    '',
    `${site.name} (${site.legalName}), ${a.street}, ${a.postalCode} ${a.city}, Slovenija.`,
    `Panoge: ${site.industries.join(', ')}.`,
    `Kontakt: ${site.email}. Pogovor o vaših procesih: ${site.bookingUrl}`,
    `LinkedIn: ${site.linkedin}`,
  ].join('\n');
}

async function faqMd(locale: Locale, key: string): Promise<string> {
  const faq = await getFaq(locale, key);
  if (!faq) return '';
  return `### ${faq.title}\n\n${faq.items.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}`;
}

function cta(c: { title: string; text: string }): string {
  return `### ${c.title}\n\n${c.text}\n\nRezervacija pogovora: ${site.bookingUrl}`;
}

/** Celotno besedilo strani v Markdownu. */
export async function pageMarkdown(locale: Locale, entry: PageEntry): Promise<string> {
  const d = entry.data;
  const pageUrl = await url(locale, d.translationKey);
  const head = (h1: string) => `## ${h1}\n\nURL: ${pageUrl}`;

  switch (d.template) {
    case 'home': {
      const rows = indexRows(locale);
      return [
        head(d.h1),
        d.lead,
        '### Kazalo',
        rows.map((r) => `- [${r.title}](${absoluteUrl(r.path)}): ${r.description}`).join('\n'),
        `### Z nami so delali\n\n${site.clients.join(', ')}`,
      ].join('\n\n');
    }
    case 'storitve': {
      const groups = await Promise.all(
        d.groups.map(async (g) => {
          const tiles = await getTiles(locale, d.translationKey, g.group);
          return `### ${g.title}\n\n${tiles.map((t) => `- **${t.code} ${t.title}**: ${t.description}`).join('\n')}${
            g.cta ? `\n- **${g.cta.title}** ${g.cta.description}` : ''
          }`;
        })
      );
      return [
        head(d.hero.h1),
        plain(d.hero.lead),
        ...groups,
        `### ${d.costs.title}\n\n${d.costs.items.map((c) => `- **${c.label}, ${c.title}**: ${c.text}`).join('\n')}\n\n${d.costs.note}`,
        await faqMd(locale, d.faq),
      ].join('\n\n');
    }
    case 'vodnik': {
      const sources = await getSources(locale, d.sources.key);
      return [
        head(d.hero.h1),
        d.date ? `Objavljeno: ${d.date.toISOString().slice(0, 10)}` : '',
        d.hero.lead,
        `### ${d.compliance.title}\n\n${d.compliance.text}\n\n${d.compliance.items.map((x) => `- **${x.abbr}, ${x.title}**: ${x.text}`).join('\n')}`,
        `### ${d.research.title}\n\n${d.research.items.map((x) => `- **${x.value}** ${x.text} (Vir: ${x.source})`).join('\n')}`,
        `### ${d.steps.title}\n\n${d.steps.intro}`,
        ...d.steps.phases.map((p) => `#### ${p.label}: ${p.title}\n\n${p.text}\n\n${titled(p.cards)}`),
        `### ${d.partner.title}\n\n${d.partner.text}\n\n${d.partner.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`,
        `### ${d.approach.title}\n\n${d.approach.intro}\n\n${titled(d.approach.items)}`,
        `### Viri\n\n${sources.map((s) => `- [${s.label}](${s.url})`).join('\n')}`,
        cta(d.cta),
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    case 'lokalna-ai':
      return [
        head(d.hero.h1),
        plain(d.hero.lead),
        `### ${d.meaning.title}\n\n${titled(d.meaning.items)}`,
        `### ${d.when.title}\n\n${d.when.text}\n\n${list(d.when.items)}`,
        `### ${d.security.title}\n\n${titled(d.security.items)}`,
        `### ${d.costs.title}\n\n${d.costs.text}\n\n${d.costs.items.map((c) => `- **${c.label}, ${c.title}**: ${c.text}`).join('\n')}`,
        `### ${d.process.title}\n\n${d.process.steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.text}`).join('\n')}`,
        await faqMd(locale, d.faq),
        cta(d.cta),
      ].join('\n\n');
    case 'ekipe': {
      const tiles = await getTiles(locale, d.translationKey, d.forms.group);
      return [
        head(d.hero.h1),
        d.hero.lead,
        `### ${d.forms.title}\n\n${tiles.map((t) => `- **${t.title}**: ${t.description}`).join('\n')}`,
        `### ${d.deliverables.title}\n\n${titled(d.deliverables.items)}`,
        `### ${d.process.title}\n\n${d.process.text}\n\n${d.process.steps.map((s, i) => `${i + 1}. **${s.title}**: ${s.text} ${d.process.resultLabel} ${s.result}`).join('\n')}`,
        `### ${d.security.title}\n\n${titled(d.security.items)}`,
        `### ${d.afterPilot.title}\n\n${d.afterPilot.items.map((x) => `- **${x.label}, ${x.title}**: ${x.text}`).join('\n')}`,
        await faqMd(locale, d.faq),
        cta(d.cta),
      ].join('\n\n');
    }
    case 'proizvodnja': {
      const cases = await getCases(locale, 'proizvodnja');
      return [
        head(d.hero.h1),
        d.hero.lead,
        `${d.hero.stats.eyebrow}:\n${d.hero.stats.items.map((s) => `- ${s.v}: ${s.t}`).join('\n')}`,
        `### ${d.friction.title}\n\n${titled(d.friction.items)}`,
        `### ${d.cases.title}\n\n${cases.map((c) => `- **${c.data.title}** (${c.data.tag}): ${c.data.lead}`).join('\n')}`,
        `### ${d.solutions.title}\n\n${d.solutions.text}\n\n${d.solutions.items.map((x) => `- **${x.title}**: ${x.text} ${x.benefit}.`).join('\n')}`,
        `### ${d.product.title}\n\n${d.product.text}\n\n${titled(d.product.items)}`,
        `### ${d.start.title}\n\n${titled(d.start.items)}`,
        cta(d.cta),
      ].join('\n\n');
    }
    case 'reference': {
      const cases = await getCases(locale, 'reference');
      const caseMd = cases.map((c) => {
        const kpis = c.data.kpis.filter((k) => !/\[.*\]/.test(k.v + k.t));
        return [
          `### ${c.data.title}`,
          `${c.data.tag}`,
          c.data.lead,
          `Izziv:\n${list(c.data.izziv)}`,
          `Rešitev:\n${list(c.data.resitev)}`,
          kpis.length ? `Rezultat:\n${kpis.map((k) => `- ${k.v}: ${k.t}`).join('\n')}` : '',
          c.data.tags.length ? `Sistemi: ${c.data.tags.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join('\n\n');
      });
      return [head(d.hero.h1), d.hero.lead, ...caseMd, `### Z nami so delali\n\n${d.clients.join(', ')}`, cta(d.cta)].join('\n\n');
    }
    default:
      return head(d.title);
  }
}

/** Strani, ki so v llms-full.txt (SPEC, razdelek 7). */
export const FULL_TEXT_PAGES = ['home', 'storitve', 'vodnik', 'lokalna-ai', 'ekipe', 'proizvodnja', 'reference'];

export async function fullText(locale: Locale): Promise<string> {
  const parts: string[] = [`# Kalmia: celotna besedila ključnih strani`, companyFacts()];
  for (const key of FULL_TEXT_PAGES) {
    const page = await getPage(locale, key).catch(() => null);
    if (page && !page.data.draft) parts.push(await pageMarkdown(locale, page));
  }
  return parts.join('\n\n') + '\n';
}
