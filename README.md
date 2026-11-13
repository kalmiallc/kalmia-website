# kalmia.si

Statična spletna stran Kalmia d.o.o. (Astro, TypeScript, Vercel). Pravila dela so v `CLAUDE.md`, specifikacija v `SPEC.md`, potrjen prototip v `/prototip`.

## Ukazi

- `npm install`: namestitev (Node 22.23.4 ali novejši)
- `npm run dev`: razvojni strežnik na http://localhost:4321
- `npm run build`: statična gradnja v `dist/`
- `npm run check`: Astro check in preverjanje zgrajenih strani (`scripts/check-dist.mjs`); zaženi po `npm run build`

## Struktura

- `content/`: vsa vsebina (Markdown, JSON). Besedila vmesnika v `content/i18n/<jezik>.json`, kazalo in noga v `content/navigation.json`, podatki o podjetju in `bookingUrl` v `content/site.json`.
- `src/components/`: komponente (glava, kazalo, noga, ploščice, kartica reference, FAQ, temni odsek, poziv).
- `src/layouts/BaseLayout.astro`: `<head>`, glava, noga.
- `src/assets/fonts/`: Urbanist in Space Grotesk (OFL), gostovani lokalno prek Astro Fonts API.
- `/razvoj/komponente`: predogled komponent, zgradi se le zunaj produkcije.
