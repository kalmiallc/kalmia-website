/**
 * Nepotrjene vrednosti v vsebini (npr. "[X]", "[merilo]") se na strani ne prikažejo.
 * Ob buildu izpišemo opozorilo, da jih ne spregledamo.
 */
const PLACEHOLDER = /\[[^\]]*\]/;

export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || PLACEHOLDER.test(value);
}

const warned = new Set<string>();

export function warnPlaceholder(where: string, value: string): void {
  const key = `${where}::${value}`;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`\n[vsebina] Nepotrjena vrednost "${value}" v ${where} ni prikazana.`);
}

/** Odstrani elemente z nepotrjenimi vrednostmi in zanje izpiše opozorilo. */
export function withoutPlaceholders<T>(items: T[], fields: (item: T) => string[], where: string): T[] {
  return items.filter((item) => {
    const bad = fields(item).find((v) => isPlaceholder(v));
    if (bad !== undefined) warnPlaceholder(where, bad);
    return bad === undefined;
  });
}
