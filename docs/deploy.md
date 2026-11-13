# Deploy kalmia.si

Stran se objavlja na AWS **eu-central-1** s SST, en sklad na okolje (`dev`, `staging`, `production`). Postavitev je enaka kot pri projektu si-explorer, le brez API, Lambd in baze.

V tem dokumentu ni skrivnosti. Gesel, ključev in žetonov ne lepite v git, tikete ali dnevnike.

## Kaj ustvari SST

- **Statična stran**: S3 vedro in CloudFront distribucija z vsebino Astrove mape `dist/`. SST sam zažene `npm run build`.
- **Usmerjanje poti**: CloudFront funkcija SST pretvori `/storitve` v `/storitve/index.html`. Neobstoječa pot vrne `404.html` s statusom 404.
- **Preusmeritve s stare strani**: iz `content/redirects.json` (glejte spodaj) v CloudFront funkciji ob zahtevi.
- **Varnostne glave**: v CloudFront funkciji ob odgovoru (`infra/edge.ts`): HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. CSP dodamo skupaj z analitiko (faza 6).
- **noindex**: vsa okolja razen `production` vračajo `X-Robots-Tag: noindex, nofollow`.
- **Predpomnjenje**: HTML brez predpomnjenja, `/_astro/**` (datoteke z zgoščeno vrednostjo v imenu) eno leto, ostalo (slike, `sitemap.xml`, `robots.txt`, `llms.txt`) eno uro. Ob vsakem deployu SST razveljavi predpomnilnik CloudFront.

Okolje `production` ima `protect: true` in `removal: "retain"`: sklada ni mogoče pomotoma odstraniti, vedro ostane tudi ob odstranitvi.

## Preusmeritve (`content/redirects.json`)

Seznam objektov `{ "from", "to", "status" }`. Status je 301 ali 302.

```json
[
  { "from": "/sl", "to": "/", "status": 301 },
  { "from": "/sl/case/weiler", "to": "/reference/weiler-abrasives", "status": 301 },
  { "from": "/sl/blog/:slug", "to": "/blog/:slug", "status": 301 },
  { "from": "/case/weiler", "to": "/reference/weiler-abrasives", "status": 302 }
]
```

- Ujemanje ne loči velikih in malih črk in ignorira končno poševnico.
- `:ime` se ujema z enim delom poti in se v cilju zapiše z malimi črkami.
- CloudFront funkcija sme imeti največ 10 KB kode. Za skupine URL-jev uporabite vzorce (`:slug`), ne posameznih vrstic. Preverjanje (`npm run typecheck:infra`) javi napako, če je seznam prevelik ali neveljaven, in za vsako preusmeritev preveri, kam vodi.

Datoteka še ne obstaja; pripravimo jo v fazi 6. Dokler je ni, stran nima preusmeritev.

## Domena

Brez `SITE_DOMAIN` je stran dosegljiva na ustvarjenem naslovu `https://<id>.cloudfront.net` (izpis v povzetku zagona Deploy).

Z `SITE_DOMAIN` (npr. `kalmia.si`) SST pričakuje gostujočo cono v Route 53 v istem računu, sam ustvari certifikat in DNS zapise ter zapre naslov `cloudfront.net`. `SITE_DOMAIN_REDIRECTS` (npr. `www.kalmia.si`) so dodatne domene, ki s 301 vodijo na glavno.

Če DNS za kalmia.si ostane pri drugem ponudniku, je treba v `sst.config.ts` nastaviti `dns: false` in `cert` (ARN certifikata ACM v us-east-1) ter zapise CNAME urediti ročno.

## CI

| Workflow | Kdaj |
| --- | --- |
| `.github/workflows/site.yml` | Pull requesti, ki spremenijo stran ali vsebino. `npm run check` in `npm run build`. |
| `.github/workflows/infra.yml` | Pull requesti, ki spremenijo sklad, preusmeritve, skripte ali workflowe. Brez deploya na AWS. |
| `.github/workflows/deploy.yml` | Ročni zagon (`workflow_dispatch`) za `dev`, `staging` ali `production`. Push na `main` objavi **dev**, ko je spremenljivka repozitorija `AWS_DEPLOY_ENABLED` enaka `true`. |

Deploy uporablja GitHub OIDC. `AWS_DEPLOY_ROLE_ARN` je vloga IAM, ki jo workflow prevzame. Dostopnih ključev AWS ne shranjujte v GitHub.

Workflow izbere GitHub Environment z imenom `dev`, `staging` ali `production`. Naslov objavljene strani je v povzetku zagona in pri okolju na GitHubu.

### Ročni deploy v produkcijo

GitHub, zavihek Actions, workflow **Deploy**, Run workflow, izberite `production`. Priporočeno: v okolju `production` na GitHubu nastavite obvezne pregledovalce, da deploy počaka na potrditev.

## GitHub Environment

Eno okolje na stage. Samo imena:

| Ime | Vrsta | Namen |
| --- | --- | --- |
| `AWS_DEPLOY_ROLE_ARN` | Secret (repozitorij ali okolje) | Vloga OIDC. Ni dostopni ključ. |
| `AWS_DEPLOY_ENABLED` | Spremenljivka repozitorija | `true` objavi `dev` ob pushu na `main`. |
| `SITE_DOMAIN` | Spremenljivka okolja | Neobvezno. Npr. `kalmia.si` v `production`, `dev.kalmia.si` v `dev`. Route 53. |
| `SITE_DOMAIN_REDIRECTS` | Spremenljivka okolja | Neobvezno. Z vejico ločene domene, ki vodijo na `SITE_DOMAIN`, npr. `www.kalmia.si`. |

## Enkratna nastavitev AWS

1. Ustvarite vlogo IAM, ki jo GitHub Actions prevzame prek OIDC (`token.actions.githubusercontent.com`), omejeno na ta repozitorij. Vloga potrebuje S3, CloudFront (s `cloudfront-keyvaluestore`), ACM in Route 53 (samo z domeno), IAM za vloge, ki jih ustvari SST, ter SSM in S3 za stanje SST. Za prvi deploy zadošča politika iz si-explorer (`docs/deploy.md`, razdelek »Deploy role permissions«); po prvem deployu jo zožite.
2. ARN vloge shranite kot `AWS_DEPLOY_ROLE_ARN`.
3. Ustvarite okolja `dev`, `staging` in `production` ter nastavite spremenljivke iz tabele.
4. Neobvezno: `AWS_DEPLOY_ENABLED` nastavite na `true`, ko naj push na `main` objavi `dev`.

### Pogoj zaupanja OIDC

Organizacija kalmiallc uporablja trditev `sub` z ID-ji. Za ta repozitorij:

```text
repo:kalmiallc@27367679/kalmia-website@1456350894:*
```

Za omejitev vloge na eno okolje uporabite `:environment:<stage>` namesto `:*`. `configure-aws-credentials` pošilja oznake seje, zato mora `Action` vsebovati `sts:AssumeRoleWithWebIdentity` in `sts:TagSession`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": ["sts:AssumeRoleWithWebIdentity", "sts:TagSession"],
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:kalmiallc@27367679/kalmia-website@1456350894:*"
        }
      }
    }
  ]
}
```

`ACCOUNT_ID` zamenjajte z računom AWS. Ponudnik OIDC mora v računu že obstajati.

## Lokalno

```bash
npm ci
npm run typecheck:infra
AWS_PROFILE=<profil> npm run deploy:dev
```

Astrov `tsconfig.json` mora izključiti `sst.config.ts` in `.sst`, sicer `astro check` javi napake v tipih SST.
