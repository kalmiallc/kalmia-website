// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config';

const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
const LATIN_EXT =
  'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/** @param {string} file @param {string} weight */
const variants = (file, weight) => [
  { src: [`./src/assets/fonts/${file}-latin-wght-normal.woff2`], weight, style: 'normal', unicodeRange: /** @type {[string]} */ ([LATIN]) },
  { src: [`./src/assets/fonts/${file}-latin-ext-wght-normal.woff2`], weight, style: 'normal', unicodeRange: /** @type {[string]} */ ([LATIN_EXT]) },
];

export default defineConfig({
  site: 'https://kalmia.si',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  env: {
    schema: {
      /** Okolje na Vercelu: production, preview ali development. Lokalno ni nastavljeno. */
      VERCEL_ENV: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
  // Blog in projekti nimajo kode; Shiki uporablja vstavljene sloge, ki niso združljivi s CSP.
  markdown: { syntaxHighlight: false },
  // CSP: Astro v <meta> doda zgoščene vrednosti (hash) za vse vstavljene skripte in sloge.
  // Direktive, ki jih <meta> ne podpira (frame-ancestors), so v glavah v vercel.json.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
  i18n: {
    defaultLocale: 'sl',
    locales: ['sl', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Urbanist',
      cssVariable: '--font-display',
      fallbacks: ['sans-serif'],
      display: 'swap',
      options: { variants: /** @type {any} */ (variants('urbanist', '100 900')) },
    },
    {
      provider: fontProviders.local(),
      name: 'Space Grotesk',
      cssVariable: '--font-body',
      fallbacks: ['sans-serif'],
      display: 'swap',
      options: { variants: /** @type {any} */ (variants('space-grotesk', '300 700')) },
    },
  ],
});
