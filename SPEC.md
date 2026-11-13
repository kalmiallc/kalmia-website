# SPEC.md: nova kalmia.si

Specifikacija za izvedbo. Pravila pisanja in dela so v `CLAUDE.md`. Vizualna in vsebinska predloga je v `/prototip`.

## 1. Cilj

Nova kalmia.si, zgrajena natančno po prototipu, ki:
- jasno predstavi Kalmio kot dolgoročnega digitalizacijskega partnerja za mala in srednja podjetja,
- je odlično vidna v iskalnikih (SEO) in v AI modelih, kot so ChatGPT, Claude, Perplexity in Google AI Overviews (GEO),
- vsak obisk usmeri na rezervacijo termina za pogovor,
- jo urejamo s Claude Code prek datotek v repozitoriju, brez admin vmesnika.

## 2. Tehnologija

- **Astro** s statičnim generiranjem (output `static`), TypeScript, Astro Content Collections z Zod shemami za vso vsebino.
- **Vercel** za gostovanje; vsak pull request dobi predogled. Predogledi in testne domene imajo `noindex` (glava `X-Robots-Tag: noindex` povsod razen na produkcijski domeni).
- **GitHub** repozitorij, delo prek vej in pull requestov.
- Brez CMS, brez baze, brez admin vmesnika, brez obrazcev.
- Pisave Urbanist in Space Grotesk gostovane lokalno (`@fontsource` ali datoteke v `/public/fonts`), `font-display: swap`, prednaložena le pisava za H1.
- Slike prek `astro:assets` (AVIF/WebP, pravilne dimenzije, `loading="lazy"` razen nad pregibom).
- Analitika brez piškotkov: Vercel Web Analytics ali Plausible (EU). Zato ni pasice za piškotke. Na strani Zasebnost to navedi.

## 3. Dvojezičnost (SL zdaj, EN kasneje)

- Privzeti jezik je slovenščina na korenu domene: `/`, `/storitve` …
- Angleščina na `/en/…`. V prvi fazi angleških strani NE objavimo, struktura pa jih mora podpirati brez predelave kode.
- Astro i18n: `defaultLocale: "sl"`, `locales: ["sl", "en"]`, `prefixDefaultLocale: false`.
- Vsa besedila vmesnika (meni, gumbi, oznake, noga) v `content/i18n/sl.json` in `content/i18n/en.json`. Nobenega besedila neposredno v komponentah.
- Vsaka vsebinska enota ima `translationKey`, ki poveže SL in EN različico. Stran se v jeziku zgradi le, če ta različica obstaja in ni `draft`.
- `hreflang` (`sl`, `en`, `x-default` → SL) samo med stranmi, ki obstajajo v obeh jezikih. Preklopnik jezika se pokaže šele, ko obstaja EN različica trenutne strani.
- `<html lang="sl">` oziroma `lang="en"`.
- Slugi so prevedeni (tabela v razdelku 4). EN slug je del vsebine, ne generiran.

## 4. Strani v prvi fazi

Vsaka stran: naslov (title, do 60 znakov), meta opis (do 155 znakov), slika za deljenje (OG), en H1.

- **Domača stran s kazalom**
  - SL: `/`
  - EN (kasneje): `/en/`
  - Prototip: `Kazalo.dc.html`
- **Naše AI storitve**
  - SL: `/storitve`
  - EN (kasneje): `/en/services`
  - Prototip: `Storitve.dc.html`
- **Vodnik: Kako varno in učinkovito uvesti AI**
  - SL: `/vodnik-uvedba-ai`
  - EN (kasneje): `/en/ai-adoption-guide`
  - Prototip: `Vodnik-AI.dc.html`
- **Lokalna AI infrastruktura**
  - SL: `/lokalna-ai-infrastruktura`
  - EN (kasneje): `/en/on-premise-ai`
  - Prototip: `Lokalna-AI.dc.html`
- **Claude ali ChatGPT za vašo ekipo**
  - SL: `/claude-chatgpt-za-ekipe`
  - EN (kasneje): `/en/claude-chatgpt-for-teams`
  - Prototip: `Uvedba-AI-v2.dc.html`
- **Proizvodna industrija**
  - SL: `/proizvodnja`
  - EN (kasneje): `/en/manufacturing`
  - Prototip: `Industrije-proizvodnja.dc.html`
- **Reference (seznam)**
  - SL: `/reference`
  - EN (kasneje): `/en/case-studies`
  - Prototip: `Reference.dc.html`
- **Posamezna referenca**
  - SL: `/reference/<slug>`
  - EN (kasneje): `/en/case-studies/<slug>`
  - Prototip: kartica iz `Reference.dc.html`
- **Blog (seznam)**
  - SL: `/blog`
  - EN (kasneje): `/en/blog`
  - Prototip: po slogu podstrani
- **Blog zapis**
  - SL: `/blog/<slug>`
  - EN (kasneje): `/en/blog/<slug>`
  - Prototip: po slogu podstrani
- **EU projekti (seznam)**
  - SL: `/projekti`
  - EN (kasneje): `/en/projects`
  - Prototip: po slogu podstrani
- **Posamezen EU projekt** (WE-Grind 5.0, EnerDAO, ONE 4.0)
  - SL: `/projekti/<slug>`
  - EN (kasneje): `/en/projects/<slug>`
  - Prototip: po slogu podstrani
- **Zasebnost**
  - SL: `/zasebnost`
  - EN (kasneje): `/en/privacy`
  - Prototip: po slogu podstrani
- **Pogoji uporabe**
  - SL: `/pogoji-uporabe`
  - EN (kasneje): `/en/terms`
  - Prototip: po slogu podstrani
- **404**
  - SL: `/404`
  - EN (kasneje): `/en/404`
  - Prototip: po slogu podstrani

Opombe:
- **Kazalo na podstraneh**: prototip ima na vsaki podstrani zložljiv panel »Kazalo« z istimi vrsticami kot domača stran. Vrstice in vrstni red so v `content/navigation.json`, trenutna stran je označena z `aria-current="page"`.
- **Hover vrstic kazala**: uporabi modro različico (`Kazalo.dc.html`): ozadje Royal, številka na Lime.
- **Posamezna referenca**: v prototipu so reference le na seznamu. Za SEO in za preusmeritve s stare strani dobi vsaka referenca svojo podstran z isto vsebino kot kartica (uvod, izziv, rešitev, rezultat, tagi) in pozivom na pogovor. Seznam na `/reference` ostane kot v prototipu, vsaka kartica pa ima povezavo na podstran.
- **EU projekti so obvezni**: projekti so sofinancirani iz EU (npr. WE-Grind 5.0 iz NOO, NextGenerationEU), objava na spletni strani je pogoj obveščanja javnosti. Vsebina strani je ENAKA kot na obstoječi strani: preberi `https://kalmia.si/sl/project` in vse podstrani projektov (npr. `https://kalmia.si/sl/project/we-grind-5_0`) ter besedila, slike in logotipe financerjev prenesi dobesedno v `content/projects/sl/<slug>.md` in `public/images/projects/`. Slugi: `we-grind-5-0`, `enerdao`, `one-4-0` (preveri dejanske stare poti in jih dodaj v preusmeritve). Projekti so v nogi povezani z »EU projekti«.
- **Zasebnost in pogoji**: besedili sta enaki kot na obstoječi strani in sta že v `content/legal/privacy.md` in `content/legal/terms.md`. Ne spreminjaj ju.
- **Statusne oznake** iz prototipa (ZA PREGLED, PREDELATI …) se ne prenesejo.

### Strani, ki jih NE izvajaš

Vse ostale datoteke prototipa so arhiv ali delovne različice: `Arhiv-*`, `AI-agenti*`, `Uvedba-AI.dc.html` (stara), `Vodnik-AI-kompakt`, `Main`, `Industrije*.dc.html` razen `Industrije-proizvodnja`, `Kazalo-hover-*`, `Zemljevid`, `Zaposlitev`, `Obrazec-*`. V `/prototip` so priložene samo strani, ki jih izvajaš.

## 5. Vsebinski model (`/content`)

```
content/
  site.json            # podjetje, kontakt, bookingUrl, družbena omrežja, seznam strank
  navigation.json      # vrstice kazala (sl/en: naslov, opis, pot)
  i18n/sl.json, en.json
  pages/sl/*.md        # besedila strani (frontmatter: title, description, ogImage, translationKey, sekcije)
  pages/en/*.md
  services/*.json      # ploščice A01–A07, P01–P03, U01–U03, S01–S04 (koda, skupina, naslov, opis, povezava ali null)
  cases/sl/*.md        # reference
  cases/en/*.md
  faq/<stran>.sl.json  # vprašanja in odgovori po straneh
  blog/sl/*.md         # 25 zapisov s stare strani je že prenesenih
  blog/en/*.md
  projects/sl/*.md     # EU projekti, prenesi s stare strani
  legal/privacy.md, terms.md   # že prenesena
  sources/vodnik.json  # viri na strani Vodnik
  redirects.json       # preusmeritve s stare strani
```

### Referenca (frontmatter)

```yaml
title: "Weiler Abrasives"
slug: "weiler-abrasives"
translationKey: "case-weiler"
industry: "proizvodnja"         # proizvodnja | trgovina | turizem | finance | splosno
tag: "Proizvodnja · brusilna sredstva · razvojni projekt"
order: 5
hidden: false                   # true = ni na strani, ni v sitemapu
showOn: ["reference", "proizvodnja"]
lead: "…"
izziv: ["…", "…"]
resitev: ["…", "…"]
kpis:
  - { v: "+35 %", t: "višji G-faktor brušenja kot pri najboljši konkurenčni rešitvi" }
tags: ["IoT senzorji", "AI modeli"]
description: "…"                # meta opis
```

Vsebino referenc in vrstni red prenesi iz `var CASES = [...]` v `Reference.dc.html` (polja `name`, `tag`, `lead`, `izziv`, `resitev`, `kpis`, `sistemi` → `tags`, `hidden`). Reference z `"hidden": true` (Ilirika) prenesi z `hidden: true`. Stran o proizvodnji prikaže reference z `showOn` vsebuje `proizvodnja`, iz istih datotek.

Slugi referenc: `extreme-vital`, `oro-orodjarna`, `slovenia-explorer`, `ilirika`, `weiler-abrasives`, `alemo`, `halder`, `digital-receptionist`, `eti`, `uvc-solutions`, `cestel`, `go-st`.

Polja, ki imajo vrednost `[X]` ali `[merilo]`, se na strani ne prikažejo (komponenta jih preskoči), build pa izpiše opozorilo.

### site.json

Že pripravljen v `content/site.json` (naslov, e-naslov info@kalmia.si, LinkedIn, rezervacija termina, seznam strank). Telefona na strani ne prikazujemo. Logotip je v `public/brand/kalmia-logo.svg` (temen, za svetlo ozadje) in `public/brand/kalmia-logo-white.svg` (za temno nogo). Favicon izdelaj iz črke K logotipa.

## 6. SEO

- Strani generirane statično, vsa vsebina v HTML.
- Unikaten `<title>` in `<meta name="description">` na vsaki strani iz frontmatter. Build pade, če manjkata.
- En H1 na stran, hierarhija H2/H3 brez preskakovanja.
- `<link rel="canonical">` na absolutni URL produkcijske domene (`https://kalmia.si/...`), brez končne poševnice, ena oblika povsod.
- Open Graph in Twitter kartice (title, description, image 1200 × 630, locale `sl_SI` / `en_US`). Privzeta OG slika v `public/og/default.png`.
- `sitemap.xml` (@astrojs/sitemap) z `lastmod`, samo indeksirane strani, z `xhtml:link` alternativami za jezike.
- `robots.txt`: dovoli vse, vključno z AI pajki (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, CCBot), povezava na sitemap.
- Strukturirani podatki (JSON-LD), generirani iz vsebine:
  - vse strani: `Organization` (ime, logo, naslov, kontakt, `sameAs`) in `WebSite`,
  - domača stran: tudi `ProfessionalService` z naslovom v Škofji Loki in `areaServed: SI`,
  - `/storitve`, `/lokalna-ai-infrastruktura`, `/claude-chatgpt-za-ekipe`: `Service` za vsako ključno storitev,
  - strani s FAQ: `FAQPage`,
  - vodnik in blog: `Article` / `BlogPosting` (author, datePublished, dateModified),
  - reference: `Article` z `about` na stranko,
  - vse podstrani: `BreadcrumbList`.
- Notranje povezave: kazalo, povezave med storitvami, referencami in vodnikom ostanejo kot v prototipu. Besedila povezav opisna (ne »klikni tukaj«).
- Slike z opisnim `alt` v slovenščini; dekorativne z `alt=""`.
- Stran 404 z ustrezno kodo, kazalom in pozivom.

## 7. Vidnost v AI modelih (GEO)

- Vsa vsebina v čistem HTML, brez nalaganja z JavaScriptom (pogoj za AI pajke).
- `/llms.txt` v korenu: kdo je Kalmia, kaj ponuja, za koga, kje, ter seznam ključnih strani s kratkim opisom. Generiran iz `site.json`, `navigation.json` in strani ob buildu.
- `/llms-full.txt`: celotna besedila ključnih strani v Markdownu (domača, storitve, vodnik, lokalna AI, ekipe, proizvodnja, reference).
- Dosledna dejstva o podjetju povsod (ime, naslov, »že več kot 10 let«, panoge). Enaka v nogi, JSON-LD in `llms.txt`.
- FAQ odgovori so kratki, neposredni in samostojni (razumljivi brez preostanka strani).
- Številke vedno s kontekstom in virom: kazalniki na referencah, viri na vodniku in v blogu.
- Na vodniku in blogu prikazan datum objave in posodobitve.
- Semantični HTML: `header`, `nav`, `main`, `article`, `section` z naslovom, `footer`.

## 8. Preusmeritve s stare strani (301)

Stara stran: slovenščina na `/sl/…`, angleščina na korenu brez `/sl`. Preusmeritve so v `content/redirects.json` in se ob buildu prenesejo v `vercel.json`.

| Stari URL | Novi URL |
|---|---|
| `/sl` | `/` |
| `/sl/ai-svetovanje` | `/storitve` |
| `/sl/workshops` | `/claude-chatgpt-za-ekipe` |
| `/sl/workshops/ai` | `/claude-chatgpt-za-ekipe` |
| `/sl/kalmia-ai-assistant` | `/lokalna-ai-infrastruktura` |
| `/sl/kalmia-sheets2app` | `/storitve` |
| `/sl/kalmia-mes` | `/proizvodnja` |
| `/sl/case/gost` | `/reference/go-st` |
| `/sl/case/oro` | `/reference/oro-orodjarna` |
| `/sl/case/weiler` | `/reference/weiler-abrasives` |
| `/sl/case/cestel` | `/reference/cestel` |
| `/sl/case/zymzo` | `/reference/digital-receptionist` |
| `/sl/case/steripro` | `/reference/uvc-solutions` |
| `/sl/case/eti` | `/reference/eti` |
| `/sl/blog` | `/blog` |
| `/sl/blog/:slug` | `/blog/:slug` (slug v male črke) |
| `/sl/project` | `/projekti` |
| `/sl/project/we-grind-5_0` | `/projekti/we-grind-5-0` |
| `/sl/project/<ostali>` | `/projekti/<slug>` (preveri dejanske poti) |
| `/sl/privacy` | `/zasebnost` |
| `/sl/terms` | `/pogoji-uporabe` |

Angleški stari URL-ji (enake poti brez `/sl`, npr. `/case/weiler`, `/kalmia-mes`, `/blog/...`): dokler EN strani ne obstajajo, **302** na slovensko ustreznico. Ko objavimo EN, jih zamenjamo s **301** na `/en/…`.

Pred zagonom:
1. Preberi `https://kalmia.si/sitemap.xml` in `https://kalmia.si/sl/sitemap.xml` (če obstajata) in preveri, da ima vsak stari URL preusmeritev. Manjkajoče dodaj v `redirects.json` in jih naštej v PR.
2. Blog zapisi s stare strani so že v `content/blog/sl/` (25 zapisov, slugi v malih črkah, stari URL v polju `legacyUrl`). Manjkajo jim datumi objave (`date: "TODO"`) in slike: za vsak zapis odpri `legacyUrl` na `https://kalmia.si`, prepiši datum objave (iz strani ali meta oznake `article:published_time`) in prenesi slike v `public/images/blog/<slug>/` z opisom alt. Besedila ne spreminjaj, razen očitnih ostankov gumbov s stare strani. Če stara stran ima zapis, ki ga v mapi ni, ga prenesi enako in ga naštej v PR.
3. Napiši test, ki za vsak stari URL preveri, da vrne 301/302 na obstoječo novo stran (ne 404).

## 9. Zakonodaja, dostopnost, varnost

- Brez obrazcev in brez piškotkov za sledenje, zato brez pasice. Če kasneje dodamo orodje s piškotki, potrebujemo pasico s soglasjem.
- Dostopnost WCAG 2.1 AA: kontrast, fokus, uporaba s tipkovnico (kazalo, FAQ), `prefers-reduced-motion`, povezave za preskok na vsebino.
- Varnostne glave v `vercel.json`: HSTS, CSP (samo lastni viri in analitika), `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`.
- Vse zunanje povezave `rel="noopener"`.

## 10. Merila sprejema

Za vsako stran:
- vizualno se ujema s prototipom na širini 1440 px in 390 px (brez vodoravnega drsenja),
- Lighthouse (mobilno): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100,
- stran deluje in je berljiva z izklopljenim JavaScriptom,
- veljaven JSON-LD (Schema.org validator), brez napak v konzoli,
- noben poziv ne vodi na obrazec; vsi vodijo na `bookingUrl`,
- nobena statusna oznaka iz prototipa ni vidna,
- nobena cena ali znesek ni na strani.

Za celoto:
- `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt` obstajajo in so pravilni,
- vse preusmeritve iz razdelka 8 delujejo (test),
- predogledne domene imajo `noindex`,
- EN struktura: dodajanje ene datoteke `content/pages/en/storitve.md` brez sprememb kode ustvari `/en/services` s pravilnim `hreflang`.

## 11. Faze dela

Po vsaki fazi odpri PR in se ustavi za pregled.

1. **Postavitev**: Astro projekt, i18n, pisave, barve, osnovne komponente (glava, noga, kazalo, ploščica, kartica reference, FAQ, temni odsek, poziv).
2. **Vsebinski model**: sheme v `src/content/config.ts`, prenos vseh besedil iz prototipa v `/content`.
3. **Strani**: vse strani iz razdelka 4 v slovenščini.
4. **Reference in blog**: seznam in podstrani referenc, blog seznam in zapisi, prenos starih zapisov.
5. **SEO in GEO**: meta, JSON-LD, sitemap, robots, llms.txt, OG slike.
6. **Preusmeritve, varnost, analitika**.
7. **Testiranje**: merila sprejema, poročilo v PR.

## 12. Odprte točke

- Vsebine z oznakami v prototipu, ki še niso potrjene: Lokalna AI (za predebatirat), Claude ali ChatGPT za vašo ekipo (predelaj vsebino), Proizvodnja (predelati), Reference (dopolniti: Halder brez kazalnika). Do potrditve te strani zgradi z `draft: true` (ne v sitemapu, `noindex`).
- Zasebnost in pogoji sta prenesena dobesedno s stare strani (v angleščini, omenjata kalmia.xyz in Google Analytics). Ne spreminjaj ju; posodobitev pripravi Mateja.
