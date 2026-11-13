/**
 * Vsebinske zbirke. Faza 1: samo strani (osnovna shema).
 * Faza 2 doda storitve, reference, FAQ, blog, projekte, vire in preusmeritve.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages' }),
  schema: z.object({
    title: z.string().min(1).max(60),
    description: z.string().min(1).max(155),
    translationKey: z.string().min(1),
    /** Pot brez jezikovne predpone in brez poševnic, "" za domačo stran. */
    slug: z.string(),
    h1: z.string().min(1),
    lead: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages };
