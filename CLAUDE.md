# CLAUDE.md: kalmia.si

Trajna pravila za delo na spletni strani kalmia.si. Velja za vsako sejo, tudi ko dodajamo blog zapis ali popravljamo besedilo. Podrobna specifikacija je v `SPEC.md`.

## O projektu

- Spletna stran podjetja Kalmia d.o.o., Kapucinski trg 7, 4220 Škofja Loka.
- Kalmia je digitalizacijski partner podjetij že več kot 10 let. Gradimo poslovne sisteme in aplikacije, uvajamo AI agente in ekipe učimo učinkovito uporabljati AI.
- Kalmia NI »AI agencija« in ne prodaja posameznih chatbotov. Tako se nikjer ne predstavljamo.
- Dizajn, struktura strani in besedila so dokončni in so v mapi `/prototip`. Ne izmišljuj novih sekcij, besedil ali vizualnih rešitev. Če nečesa v prototipu ni, vprašaj.

## Tehnologija

- Astro (statično generiranje), TypeScript, gostovanje na AWS (S3 in CloudFront prek SST, enako kot si-explorer), repozitorij na GitHubu. Deploy je opisan v `docs/deploy.md`.
- Brez CMS, brez admin vmesnika, brez baze. Vsa vsebina je v mapi `/content` kot Markdown in JSON.
- JavaScript na strani le, kjer je nujen (npr. odpiranje vprašanj FAQ). Vsa vsebina mora biti vidna brez JavaScripta.

## Jezik in pisanje (slovenščina)

- Obiskovalca vikamo (vi, vaše podjetje, dogovorite se).
- Brez pomišljajev (—, –) v besedilih. Namesto njih uporabi vejico, dvopičje ali novo poved. Za razpone piši »od … do …« ali »2024–2026« samo pri letnicah, kjer je tako v prototipu.
- »AI agenti« brez vezaja. AI je moškega spola (»AI, ki teče v vaši hiši«).
- Kalmia se sklanja brez j: Kalmia, Kalmie, Kalmii, Kalmio, pri Kalmii, s Kalmio.
- »nerazvijalci« pisano skupaj.
- Odstotki s presledkom: 40 %, ne 40%.
- Na strani NI cen in zneskov. Kategorije stroškov brez zneskov so dovoljene.
- Malo marketinškega besedila. Konkretno, kratko, preverljivo.
- Kartice in seznami, nikoli široke tabele z več stolpci.
- Pri angleških prevodih ohrani isti ton: neposredno, brez pretiravanja, brez »revolutionize«, »unlock« in podobnih fraz.

## Pozivi k dejanju

- Na celotni strani NI obrazcev. Vsak poziv vodi na rezervacijo termina: URL je v `content/site.json` (`bookingUrl`), nikoli ga ne vpisuj neposredno v komponento.
- Zunanje povezave za rezervacijo se odprejo v novem zavihku (`target="_blank" rel="noopener"`).
- Puščica → ali okrogla ikona s puščico pomeni, da kartica vodi na podstran. Kartice brez podstrani nimajo puščice in niso klikljive.

## Vizualna pravila

- Barve (iz `/prototip/tokens.json`): Ink #26262a, Paper #ffffff, Support #6b6b70, Lime #d9f91e (redek poudarek), Royal #3345cb (povezave in UI), BlockInk #23242b (temni odseki namesto čiste črne).
- Pisave: Urbanist za naslove, Space Grotesk za besedilo. Gosti jih lokalno (self-host), ne prek Google Fonts.
- Zaobljenost: gumbi 2 px, kartice 4 px.
- Oznak statusa iz prototipa (ZA PREGLED, PREDELATI, DOPOLNITI, ZA PREDEBATIRAT, PREDELAJ VSEBINO) v produkciji ni.

## Urejanje vsebine

Ko je naloga vsebinska (nov blog zapis, popravek besedila, nova referenca, sprememba kazalnika):

1. Spreminjaj SAMO datoteke v `/content` in slike v `/public/images`. Kode ne spreminjaj.
2. Če vsebinska sprememba zahteva spremembo kode, se ustavi in vprašaj.
3. Ustvari novo vejo in odpri pull request z jasnim opisom, kaj je spremenjeno. Nikoli ne potiskaj neposredno na `main`.
4. Preveri, da `npm run build` uspe. Po združitvi v `main` workflow Deploy stran objavi na okolje `dev`; povezava je v povzetku zagona. Produkcijo objavimo ročno (workflow Deploy, okolje `production`).

## Blog zapis

- Datoteka: `content/blog/sl/<slug>.md` (in kasneje `content/blog/en/<slug>.md`).
- Obvezni podatki v frontmatter: `title`, `description` (do 155 znakov), `date`, `author`, `tags`, `translationKey`. Neobvezno: `updated`, `cover`, `coverAlt`, `draft`, `legacyUrl` (stari URL za preusmeritev).
- Slug: male črke, brez šumnikov, besede ločene z vezajem (npr. `lokalni-ai-modeli-v-praksi`).
- En H1 (naslov iz frontmatter), v besedilu H2 in H3.
- Če zapis navaja številke ali raziskave, dodaj vire s povezavami na koncu.
- Slike v `/public/images/blog/<slug>/`, vedno z opisom (alt).

## Kakovost (pred vsakim PR)

- `npm run build` brez napak in opozoril.
- `npm run check` (Astro check, povezave, manjkajoči alt, manjkajoči meta opisi).
- Nobena stran ne sme imeti dveh H1, manjkajočega title ali opisa.
- Ne dodajaj knjižnic brez razloga. Vsako novo odvisnost utemelji v PR.
