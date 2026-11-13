/**
 * Datum zadnje spremembe strani za sitemap (lastmod).
 * Blog in Vodnik: polje updated ali date. Ostale strani: datum zadnjega commita
 * vsebinske datoteke (git). Če git ni na voljo, lastmod izpustimo.
 */
import { execFileSync } from 'node:child_process';
import type { Route } from './routes';

const cache = new Map<string, Date | null>();

function gitDate(file: string | undefined): Date | null {
  if (!file) return null;
  if (cache.has(file)) return cache.get(file)!;
  let date: Date | null = null;
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    date = out ? new Date(out) : null;
  } catch {
    date = null;
  }
  cache.set(file, date);
  return date;
}

export function lastmodFor(route: Route): Date | null {
  const p = route.props;
  const data = p.entry.data as { date?: Date; updated?: Date };
  if (p.kind === 'post' || (p.kind === 'page' && data.date)) return data.updated ?? data.date ?? null;
  return gitDate(p.entry.filePath);
}
