import site from '../../content/site.json';

export type Site = typeof site;
export { site };

/** Naslov podjetja v eni vrstici, kot je v nogi prototipa. */
export function addressLine(): string {
  return `${site.legalName}, ${site.address.street}, ${site.address.city}`;
}
