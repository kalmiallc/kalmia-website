# Prototip

Izvoz potrjenega prototipa iz Claude Design. Uporabi ga kot vizualno in vsebinsko predlogo, ne kot kodo za produkcijo.

## Datoteke

- `Kazalo.dc.html`: domača stran s kazalom (hover vrstic: modra različica)
- `Storitve.dc.html`: Naše AI storitve
- `Vodnik-AI.dc.html`: Kako varno in učinkovito uvesti AI v podjetje
- `Lokalna-AI.dc.html`: Lokalna AI infrastruktura
- `Uvedba-AI-v2.dc.html`: Claude ali ChatGPT za vašo ekipo
- `Industrije-proizvodnja.dc.html`: Proizvodna industrija
- `Reference.dc.html`: Reference
- `tokens.json`: barve, pisave, zaobljenost

## Kako brati datoteke

- Vsebina je znotraj `<x-dc>`. Sloge (CSS) najdeš v `<helmet><style>` in v atributih `style`.
- `<sc-for list="{{ ... }}" as="x">` je zanka, `<sc-if value="{{ ... }}">` je pogoj, `{{ ... }}` je vstavljena vrednost.
- Podatki za zanke so v `<script type="text/x-dc">` na koncu datoteke (npr. `var CASES = [...]` v `Reference.dc.html` in `Industrije-proizvodnja.dc.html`). To so dokončne vsebine referenc.
- Slike z naslovom `/_blob/...` so logotip Kalmia (svetla in temna različica). V produkciji uporabi `public/brand/kalmia-logo.svg` in `public/brand/kalmia-logo-white.svg`.
- Povezave med datotekami (`Storitve.dc.html` …) zamenjaj s potmi iz `SPEC.md`, razdelek 4.
- Statusne oznake (ZA PREGLED, PREDELATI, DOPOLNITI, ZA PREDEBATIRAT, PREDELAJ VSEBINO) so delovne oznake in v produkcijo ne gredo.
- Povezave v nogi na `kalmia.si/blog` in `kalmia.si/privacy` zamenjaj z `/blog` in `/zasebnost`.
