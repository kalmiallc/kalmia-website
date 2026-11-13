import sl from '../../content/i18n/sl.json';
import en from '../../content/i18n/en.json';

export const LOCALES = ['sl', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'sl';

/** BCP 47 oznake za <html lang> in Open Graph. */
export const HTML_LANG: Record<Locale, string> = { sl: 'sl', en: 'en' };
export const OG_LOCALE: Record<Locale, string> = { sl: 'sl_SI', en: 'en_US' };

export type UiStrings = typeof sl;
const STRINGS: Record<Locale, UiStrings> = { sl, en };

/** Vrne vsa besedila vmesnika za izbrani jezik. */
export function ui(locale: Locale): UiStrings {
  return STRINGS[locale];
}

/** Ugotovi jezik iz poti (/en/... je angleščina, vse ostalo slovenščina). */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LOCALE;
}

/** Korenska pot za jezik: "/" za slovenščino, "/en" za angleščino. */
export function homePath(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}`;
}

/** Normalizira pot: vodilna poševnica, brez končne poševnice (razen korena). */
export function normalizePath(path: string): string {
  const withLead = path.startsWith('/') ? path : `/${path}`;
  const clean = withLead
    .replace(/\.html$/, '')
    .replace(/\/index$/, '/')
    .replace(/\/+$/, '');
  return clean === '' ? '/' : clean;
}
