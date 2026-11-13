/** Pomožne funkcije za prikaz besedil iz vsebine. */

const ESCAPE: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c] ?? c);
}

/**
 * Besedilo z označenimi poudarki: **besedilo** postane poudarek (Georgia, ležeče, krepko).
 * Vse ostalo se izpiše kot navadno besedilo (HTML je ubežen).
 */
export function inlineAccent(s: string): string {
  return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong class="accent">$1</strong>');
}

/** Odstrani oznake poudarkov (za meta opise, llms.txt in podobno). */
export function plain(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '$1');
}

/** Datum v slovenski ali angleški obliki, npr. 13. 11. 2026. */
export function formatDate(date: Date, locale: 'sl' | 'en'): string {
  return new Intl.DateTimeFormat(locale === 'sl' ? 'sl-SI' : 'en-GB', {
    day: 'numeric',
    month: locale === 'sl' ? 'numeric' : 'long',
    year: 'numeric',
    timeZone: 'Europe/Ljubljana',
  }).format(date);
}

/** Datum za atribut datetime (LLLL-MM-DD). */
export function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
