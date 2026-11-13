# kalmia.si

Statična spletna stran Kalmia d.o.o. (Astro, TypeScript, Vercel). Pravila dela so v `CLAUDE.md`, specifikacija v `SPEC.md`, potrjen prototip v `/prototip`.

## Ukazi

- `npm install`: namestitev (Node 22.23.4 ali novejši)
- `npm run dev`: razvojni strežnik na http://localhost:4321
- `npm run build`: statična gradnja v `dist/`
- `npm run check`: Astro check, preverjanje zgrajenih strani (`scripts/check-dist.mjs`), test preusmeritev in usklajenost `vercel.json`; zaženi po `npm run build`
- `npm run test:redirects -- --base https://kalmia.si`: test preusmeritev s stare strani na živi postavitvi
- `npm run test:en`: preveri, da ena datoteka v `content/pages/en/` brez sprememb kode ustvari angleško stran s hreflang

## Struktura

- `content/`: vsa vsebina (Markdown, JSON), sheme v `src/content.config.ts`.
  - `site.json`: podjetje, kontakt, `bookingUrl`, seznam strank
  - `navigation.json`: vrstice kazala in povezave v nogi
  - `i18n/<jezik>.json`: besedila vmesnika
  - `pages/<jezik>/*.md`: besedila strani (frontmatter po predlogi, polje `template`)
  - `services/*.json`: ploščice A01–S04
  - `cases/<jezik>/*.md`: reference
  - `faq/<stran>.<jezik>.json`, `sources/*.json`: pogosta vprašanja, viri
  - `blog/<jezik>/*.md`, `projects/<jezik>/*.md`, `legal/*.md`
  - `redirects.json`: preusmeritve s stare strani
- Build preveri sheme in povezave med datotekami (`src/lib/content.ts`) in se ob napaki ustavi z imenom datoteke.
- `src/pages/[...slug].astro` (SL) in `src/pages/en/[...slug].astro` (EN): vse strani iz `/content`, poti sestavi `src/lib/routes.ts`. Nova datoteka v `content/<zbirka>/en/` ustvari angleško stran brez spremembe kode.
- `src/templates/`: predloga za vsako vrsto strani (polje `template` v `content/pages`), podstrani referenc in projektov, pravne strani, 404.
- `src/components/`: komponente (glava, kazalo, noga, ploščice, kartica reference, FAQ, temni odsek, poziv).
- `src/layouts/BaseLayout.astro`: `<head>`, glava, noga.
- `src/assets/fonts/`: Urbanist in Space Grotesk (OFL), gostovani lokalno prek Astro Fonts API.
