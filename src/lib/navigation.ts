import navigation from '../../content/navigation.json';
import { normalizePath, type Locale } from './i18n';

type Localized<T> = { key: string } & Partial<Record<Locale, T>>;
type IndexEntry = { title: string; description: string; path: string };
type FooterEntry = { title: string; path: string };

export interface IndexRow extends IndexEntry {
  key: string;
  /** Zaporedna številka v kazalu, npr. "01". */
  number: string;
}

function pick<T>(items: Localized<T>[], locale: Locale): (T & { key: string })[] {
  return items.flatMap((item) => {
    const value = item[locale];
    return value ? [{ key: item.key, ...value }] : [];
  });
}

/** Vrstice kazala za jezik, v vrstnem redu iz content/navigation.json. */
export function indexRows(locale: Locale): IndexRow[] {
  return pick(navigation.index as Localized<IndexEntry>[], locale).map((row, i) => ({
    ...row,
    path: normalizePath(row.path),
    number: String(i + 1).padStart(2, '0'),
  }));
}

/** Povezave v nogi za jezik. */
export function footerLinks(locale: Locale): (FooterEntry & { key: string })[] {
  return pick(navigation.footer as Localized<FooterEntry>[], locale).map((l) => ({
    ...l,
    path: normalizePath(l.path),
  }));
}
