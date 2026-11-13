/**
 * Vsebinske zbirke in sheme. Vsa vsebina je v /content.
 *
 * Astro 5+ zahteva to datoteko v src/content.config.ts (SPEC omenja src/content/config.ts,
 * ki ga novejše različice Astra ne podpirajo več).
 *
 * Napaka v shemi ustavi build in pove, katera datoteka in katero polje nista v redu.
 */
import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { existsSync, readdirSync } from 'node:fs';

/**
 * ID vnosa je pot datoteke brez končnice (npr. "sl/storitve", "storitve.sl"),
 * ne polje slug. Tako je jezik vedno razviden iz mape.
 */
const generateId = ({ entry }: { entry: string }) => entry.replace(/\.(md|json)$/, '');

/**
 * Glob loader, ki ne opozarja, ko je mapa še prazna (npr. EU projekti pred prenosom
 * s stare strani). Ko so datoteke v mapi, deluje kot običajen glob.
 */
function optionalGlob(base: string): Loader {
  const inner = glob({ pattern: '**/*.md', base, generateId });
  const hasMarkdown = (dir: string): boolean =>
    existsSync(dir) &&
    readdirSync(dir, { withFileTypes: true }).some((e) =>
      e.isDirectory() ? hasMarkdown(`${dir}/${e.name}`) : e.name.endsWith('.md')
    );
  return {
    name: 'optional-glob',
    load: async (context) => {
      if (!hasMarkdown(base)) {
        context.store.clear();
        return;
      }
      return inner.load(context);
    },
  };
}

/* ---------- Skupni gradniki ---------- */

const text = z.string().trim().min(1);
/** Ključ strani (translationKey iz content/pages), npr. "storitve". */
const pageKey = text;
const link = z.object({
  label: text,
  page: pageKey,
  /** Sidro na ciljni strani brez #, npr. "agenti". */
  anchor: text.optional(),
});
const titled = z.object({ title: text, text });
const labeled = z.object({ label: text, title: text, text });
const kpi = z.object({ v: text, t: text });
/** Datum v obliki LLLL-MM-DD. */
const isoDate = z.coerce.date();

/** Polja, ki jih ima vsaka stran. */
const pageBase = z.object({
  /** <title>, do 60 znakov. */
  title: text.max(60),
  /** Meta opis, do 155 znakov. */
  description: text.max(155),
  translationKey: text,
  /** Pot brez jezikovne predpone in brez poševnic; "" za domačo stran. Pri EN je to angleški slug. */
  slug: z.string().regex(/^[a-z0-9-]*(\/[a-z0-9-]+)*$/, 'slug: male črke, številke in vezaji'),
  /** Besedilo zadnje drobtinice v glavi. */
  breadcrumb: text.optional(),
  /** Slika za deljenje (pot v /public), sicer privzeta. */
  ogImage: text.optional(),
  /**
   * true: vsebina še ni potrjena (SPEC, razdelek 12). Stran se zgradi, ker je v kazalu,
   * a ima noindex, ni v sitemapu, llms.txt, hreflang in preklopniku jezika.
   */
  draft: z.boolean().default(false),
  date: isoDate.optional(),
  updated: isoDate.optional(),
});

const hero = z.object({
  eyebrow: text.optional(),
  h1: text,
  /** **besedilo** se prikaže kot poudarek (Georgia, ležeče, krepko). */
  lead: text,
});

const cta = z.object({
  title: text,
  text,
  eyebrow: text.optional(),
  button: text.optional(),
  layout: z.enum(['stack', 'split']).default('stack'),
});

const ctaTile = z.object({
  eyebrow: text,
  title: text,
  description: text,
  linkLabel: text.optional(),
});

const nextRow = z.object({ label: text, page: pageKey });

/* ---------- Strani: ena shema na predlogo ---------- */

const homePage = pageBase.extend({
  template: z.literal('home'),
  h1: text,
  lead: text,
});

const servicesPage = pageBase.extend({
  template: z.literal('storitve'),
  hero: hero.extend({
    deeper: z.object({ label: text, links: z.array(link).min(1) }).optional(),
  }),
  groups: z
    .array(
      z.object({
        id: text,
        /** Skupina ploščic iz content/services (polje group). */
        group: text,
        eyebrow: text,
        title: text,
        cta: ctaTile.optional(),
      })
    )
    .min(1),
  costs: z.object({
    eyebrow: text,
    title: text,
    items: z.array(labeled).min(1),
    note: text,
    button: text,
  }),
  /** Ključ datoteke v content/faq (<ključ>.<jezik>.json). */
  faq: text,
});

const guidePage = pageBase.extend({
  template: z.literal('vodnik'),
  hero,
  compliance: z.object({
    eyebrow: text,
    title: text,
    text,
    items: z.array(z.object({ abbr: text, title: text, text })).min(1),
  }),
  research: z.object({
    eyebrow: text,
    title: text,
    items: z.array(z.object({ value: text, text, source: text })).min(1),
  }),
  steps: z.object({
    eyebrow: text,
    title: text,
    intro: text,
    phases: z
      .array(
        z.object({
          label: text,
          title: text,
          text,
          cards: z.array(titled.extend({ link: link.optional() })).min(1),
        })
      )
      .min(1),
  }),
  partner: z.object({ eyebrow: text, title: text, text, questions: z.array(text).min(1) }),
  approach: z.object({ eyebrow: text, title: text, intro: text, items: z.array(titled).min(1) }),
  next: z.object({ eyebrow: text, title: text, pages: z.array(pageKey).min(1) }),
  sources: z.object({ eyebrow: text, key: text }),
  cta,
});

const localAiPage = pageBase.extend({
  template: z.literal('lokalna-ai'),
  hero,
  meaning: z.object({ eyebrow: text, title: text, items: z.array(titled).min(1) }),
  when: z.object({ eyebrow: text, title: text, text, items: z.array(text).min(1) }),
  security: z.object({ eyebrow: text, title: text, items: z.array(titled).min(1) }),
  costs: z.object({ eyebrow: text, title: text, text, items: z.array(labeled).min(1) }),
  process: z.object({ eyebrow: text, title: text, steps: z.array(titled).min(1) }),
  faq: text,
  cta,
});

const teamsPage = pageBase.extend({
  template: z.literal('ekipe'),
  hero,
  forms: z.object({ eyebrow: text, title: text, group: text, cta: ctaTile }),
  deliverables: z.object({ eyebrow: text, title: text, items: z.array(titled).min(1) }),
  process: z.object({
    eyebrow: text,
    title: text,
    text,
    resultLabel: text,
    steps: z.array(titled.extend({ result: text })).min(1),
  }),
  security: z.object({ eyebrow: text, title: text, items: z.array(titled).min(1) }),
  afterPilot: z.object({ eyebrow: text, title: text, link, items: z.array(labeled).min(1) }),
  faq: text,
  cta,
});

const manufacturingPage = pageBase.extend({
  template: z.literal('proizvodnja'),
  hero: z.object({
    h1: text,
    lead: text,
    casesLink: text,
    stats: z.object({ eyebrow: text, items: z.array(kpi).min(1) }),
  }),
  friction: z.object({
    title: text,
    items: z.array(z.object({ badge: text, badgeNote: text, title: text, text })).min(1),
  }),
  cases: z.object({
    id: text,
    eyebrow: text,
    title: text,
    allLink: text,
    systemsLabel: text,
    inPreparationNote: text,
    inPreparationTab: text,
  }),
  solutions: z.object({
    eyebrow: text,
    title: text,
    text,
    items: z.array(titled.extend({ benefit: text })).min(1),
  }),
  product: z.object({ eyebrow: text, title: text, text, items: z.array(titled).min(1) }),
  start: z.object({ eyebrow: text, title: text, items: z.array(titled).min(1) }),
  next: nextRow,
  cta,
});

const referencesPage = pageBase.extend({
  template: z.literal('reference'),
  hero,
  clients: z.array(text).min(1),
  next: nextRow,
  cta,
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages', generateId }),
  schema: z.discriminatedUnion('template', [
    homePage,
    servicesPage,
    guidePage,
    localAiPage,
    teamsPage,
    manufacturingPage,
    referencesPage,
  ]),
});

/* ---------- Ploščice storitev ---------- */

const tileText = z.object({ title: text, description: text });
const tileLink = z.object({ page: pageKey, anchor: text.optional() }).nullable();

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './content/services', generateId }),
  schema: z.object({
    /** A01–A07, P01–P03, U01–U03, S01–S04 */
    code: z.string().regex(/^[A-Z]\d{2}$/),
    group: text,
    order: z.number().int().positive(),
    /** Stran, na katero vodi ploščica, ali null (ploščica ni klikljiva). */
    link: tileLink,
    sl: tileText,
    en: tileText.optional(),
    /** Odstopanja na posamezni strani (ključ je translationKey strani). */
    onPages: z
      .record(
        z.string(),
        z.object({
          link: tileLink.optional(),
          sl: tileText.partial().optional(),
          en: tileText.partial().optional(),
        })
      )
      .optional(),
  }),
});

/* ---------- Reference ---------- */

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/cases', generateId }),
  schema: z.object({
    title: text,
    slug: z.string().regex(/^[a-z0-9-]+$/),
    translationKey: text,
    industry: z.enum(['proizvodnja', 'trgovina', 'turizem', 'finance', 'splosno']),
    tag: text,
    order: z.number().int().positive(),
    /** true: ni na strani in ni v sitemapu. */
    hidden: z.boolean().default(false),
    showOn: z.array(z.enum(['reference', 'proizvodnja'])).default(['reference']),
    /** Vrstni red na posamezni strani, če se razlikuje od order. */
    orderOn: z.record(z.string(), z.number().int().positive()).optional(),
    inPreparation: z.boolean().default(false),
    description: text.max(155),
    lead: text,
    izziv: z.array(text).min(1),
    resitev: z.array(text).min(1),
    kpis: z.array(kpi).default([]),
    headline: kpi.optional(),
    rezultati: z.array(text).default([]),
    tags: z.array(text).default([]),
    draft: z.boolean().default(false),
  }),
});

/* ---------- Pogosta vprašanja in viri ---------- */

const faq = defineCollection({
  loader: glob({ pattern: '*.json', base: './content/faq', generateId }),
  schema: z.object({
    title: text,
    items: z.array(z.object({ q: text, a: text })).min(1),
  }),
});

const sources = defineCollection({
  loader: glob({ pattern: '*.json', base: './content/sources', generateId }),
  schema: z.object({
    sl: z.object({ items: z.array(z.object({ label: text, url: z.url() })).min(1) }),
    en: z.object({ items: z.array(z.object({ label: text, url: z.url() })).min(1) }).optional(),
  }),
});

/* ---------- Blog ---------- */

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/blog', generateId }),
  schema: ({ image }) =>
    z.object({
      title: text,
      description: text.max(155),
      /**
       * Datum objave. "TODO" je dovoljen le začasno, dokler v fazi 4 ne prenesemo
       * datumov s stare strani; takšen zapis se ne objavi.
       */
      date: z.union([isoDate, z.literal('TODO')]),
      updated: isoDate.optional(),
      author: text,
      tags: z.array(text).default([]),
      translationKey: text,
      cover: image().optional(),
      coverAlt: text.optional(),
      draft: z.boolean().default(false),
      /** Stari URL (npr. /sl/blog/...) za 301 preusmeritev. */
      legacyUrl: z.string().startsWith('/').optional(),
    }).refine((d) => !d.cover || d.coverAlt, { message: 'cover potrebuje coverAlt', path: ['coverAlt'] }),
});

/* ---------- EU projekti ---------- */

const projects = defineCollection({
  loader: optionalGlob('./content/projects'),
  schema: z.object({
    /** Polni naslov projekta (H1), dobesedno s stare strani. */
    title: text,
    /** Kratko ime za drobtinice in seznam. */
    breadcrumb: text,
    description: text.max(155),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    translationKey: text,
    order: z.number().int().positive().default(1),
    eyebrow: text.optional(),
    /** Logotipi financerjev, dobesedno s stare strani, v /public/images/projects. */
    logos: z
      .array(
        z.object({
          src: z.string().startsWith('/images/projects/'),
          alt: text,
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        })
      )
      .min(1),
    legacyUrl: z.string().startsWith('/').optional(),
    draft: z.boolean().default(false),
  }),
});

/* ---------- Pravna besedila ---------- */

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/legal', generateId }),
  schema: z.object({
    title: text,
    description: text.max(155).optional(),
    legacyUrl: z.string().startsWith('/').optional(),
  }),
});

export const collections = { pages, services, cases, faq, sources, blog, projects, legal };
