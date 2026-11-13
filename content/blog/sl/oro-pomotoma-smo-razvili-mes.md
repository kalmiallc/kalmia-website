---
title: "Pomotoma smo razvili MES – le zato, da bi ugotovili, katere podatke potrebujemo."
# Krajši naslov za <title> in iskalnike (do 60 znakov); naslov na strani ostane title.
seoTitle: "Pomotoma smo razvili MES"
description: "K nam je pristopila stranka s specifičnim ciljem: optimizirati učinkovitost njihovih CNC strojev."
date: 2025-05-26
cover: "/images/blog/oro-pomotoma-smo-razvili-mes/naslovna.webp"
coverAlt: "Pomotoma smo razvili MES – le zato, da bi ugotovili, katere podatke potrebujemo."
author: "Kalmia"
tags: ["Proizvodnja · Industrijska oprema"]
translationKey: "blog-oro-pomotoma-smo-razvili-mes"
legacyUrl: "/sl/blog/oro-pomotoma-smo-razvili-mes"
---

K nam je pristopila stranka s specifičnim ciljem: optimizirati učinkovitost njihovih CNC strojev.

## Izkoristek strojev je ključni dejavnik.

V začetni fazi sodelovanja je bilo za stranko bistveno, da natančno razume, koliko časa je bil vsak CNC stroj dejansko v uporabi med načrtovanimi proizvodnimi urami. Ta vpogled bo služil kot osnova za prepoznavanje ozkih grl, zmanjšanje izpadov in izboljšanje splošne produktivnosti.

Stranko pa niso zanimali le podatki sami, temveč tudi način njihove predstavitve. Želeli so jasen, ažuren pregled vsakega CNC stroja – predvsem njegov trenutni status (vklopljen/izklopljen) in temperaturo. Tako je stranka potrebovala preprost in učinkovit nadzor nad stanjem strojev.

V ta namen smo razvili mobilno prijazen spletni vmesnik z intuitivno in vizualno privlačno nadzorno ploščo. Po njihovih informacijah je izboljšana preglednost nad stroji dejansko bistveno prispevala k večji učinkovitosti. Naslednji korak je bila integracija časa delovanja strojev z delovnimi nalogi. Ta povezava je prinesla nove vpoglede: s povezavo podatkov o uporabi strojev z določenimi delovnimi nalogi smo lahko natančno sledili časom posameznih proizvodnih opravil.

Na tej točki se je sistem razvil v osnovni MES (Manufacturing Execution System – sistem za vodenje proizvodnje), ki je bil sposoben slediti delovnim časom v vseh fazah proizvodnega procesa. Vendar pa so se izboljšave v učinkovitosti izkazale za manj dragocene kot presenetljivo novo področje: planiranje in vrednotenje stroškov.

## Napovedi za optimizirano proizvodnjo

Eden izmed ključnih poslovnih procesov stranke je priprava ponudb za stranke. Običajno se ta začne, ko stranka posreduje 3D model želenega končnega izdelka. Tu se začne kompleksen in dolgotrajen inženirski postopek: njihovi inženirji morajo 3D model končnega izdelka pretvoriti v natančen proizvodni model.

Da bi ta proces naredili bolj učinkovit, se je stranka odločila začeti z implementacijo sistema, ki bi omogočal napovedovanje časa izdelave neposredno iz 3D modela končnega izdelka. Ker so se dejanski proizvodni časi že spremljali in povezovali s konkretnimi delovnimi nalogi, smo imeli ključen podatek – dejanski čas, potreben za izdelavo orodja.

V procesu je bilo bistveno izluščiti parametre, ki močno korelirajo s kompleksnostjo in časom izdelave. Ti parametri so bili definirani iz modelov orodij. Obstaja veliko parametrov, ki vplivajo na čas izdelave (dimenzije, število in kompleksnost votlin, polmeri in ukrivljenosti, število potrebnih vrtanj itd.).

Na koncu smo uspeli izolirati 3 parametre – najbolj vplivne dejavnike, tiste z največjim vplivom na zasnovo orodja in posledično na čas CNC obdelave. Ključni parametri so bili:

- skupna dimenzija orodja,
- volumen materiala, ki ga je treba obdelati s površine,
- število votlin, korigirano s faktorjem kompleksnosti radijev.

Preizkusili smo veliko število parametrov, preden smo se odločili za te tri ključne vrednosti – kar je pomenilo, da smo razvili že precej napreden MES sistem. It te izkušnje smo se naučili kako hitreje izluščit prave parametre tudi za druge stranke.

Definicija teh parametrov iz modela orodja in njihova korelacija s proizvodnimi časi nam je omogočila napovedovanje trajanja proizvodnje direktno iz modela orodja. Ta postopek ni bil enostaven in je zahteval veliko iteracij in prilagoditev, da smo končno dosegli dobre ocene.

Čeprav so 3D modeli, ki jih posredujejo stranke, običajno ne vsebujejo dovolj podrobnosti za avtomatsko generacijo celotnega proizvodnega načrta, vseeno nudijo dovolj informacij za primerjavo z ostalimi. Tako smo imeli možnost primerjati nove naročene izdelke z že obstoječimi. Ustvarjen je bil vmesnik, kjer lahko prodajalec vidi seznam podobnih izdelkov in identificira model, ki se najbolj ujema s takšnim, ki je bil že izdelan v preteklosti.

Tako smo omogočili možnost napovedovanja časa proizvodnje na podlagi modela, ki ga je posredovala stranka. Ta napoved je bila glede na prejšnji proces bistveno hitrejša in je vključevala precej manj ljudi. Z vsem tem vzpostavljenim je stranka lahko sodelovala pri več hitrih razpisih in več energije svoje ponudbene ekipe namenila optimizaciji tveganj in planiranju.

Za nas pa je bila največja lekcija ta, da učinkovitost ni edina in največja prednost sledenja podatkom. Prav tako smo se naučili kako smiselno ločiti med uporabnimi podatki in zbranimi podatki, kar je za nas predstavljalo veliko vrednost.

Borut Terpinc

Preberite tudi:

• [Kako je ORO s podatki in AI asistentom spremenil proizvodne procese](/reference/oro-orodjarna)

• [AI v proizvodnji - 3 načini, kako podjetja dosegajo merljiv prihranek časa](/blog/ai-v-proizvodnji-odstranite-ozka-grla)
