# Prvo sporočilo za Claude Code

Prilepi v Claude Code, ko je vsebina tega paketa (`CLAUDE.md`, `SPEC.md`, `prototip/`, `content/`, `public/`) v korenu praznega repozitorija.

---

Izdelaj novo spletno stran kalmia.si.

Najprej v celoti preberi `CLAUDE.md`, `SPEC.md` in `prototip/README.md`, nato vse datoteke v `prototip/`. V `content/` so že pripravljeni `site.json`, blog zapisi s stare strani in pravni besedili, v `public/brand/` pa logotip. Dizajn, struktura in besedila so dokončni: natančno jih prenesi, ničesar ne spreminjaj in ne dodajaj. Če je kaj nejasno ali v prototipu manjka, vprašaj, preden ugibaš.

Tehnologija: Astro (statično), TypeScript, vsebina v `/content` (Markdown in JSON), gostovanje na AWS prek SST (`docs/deploy.md`), brez CMS, admin vmesnika, baze in obrazcev. Vse ostalo je v `SPEC.md`.

Ključno:
- slovenščina zdaj, angleščina kasneje na `/en/`; struktura mora podpirati oba jezika brez sprememb kode,
- SEO in vidnost v AI modelih po razdelkih 6 in 7 v `SPEC.md`, vsa vsebina v HTML brez JavaScripta,
- vsi pozivi vodijo na `bookingUrl` iz `content/site.json`,
- 301 preusmeritve s stare strani po razdelku 8.

Delaj po fazah iz razdelka 11. Po vsaki fazi odpri pull request s povzetkom ter se ustavi za moj pregled. Začni s fazo 1.
