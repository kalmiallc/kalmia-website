/**
 * Vzorčni podatki za predogledno stran komponent (/razvoj/komponente).
 * Dobesedno iz prototipa. Stran se v produkciji ne zgradi; v fazi 3 jo odstranimo,
 * vsebina pa se iz /content prikaže na pravih straneh.
 */
export const agentTiles = [
  { code: 'A01', title: 'Baza znanja podjetja', description: 'Asistent, ki odgovarja iz vaših dokumentov, pravilnikov in postopkov. Teče v oblaku v EU ali na vaših strežnikih.' },
  { code: 'A02', title: 'Triaža e-pošte', description: 'Razvrsti prejeto pošto, jo usmeri in pripravi osnutke odgovorov.' },
  { code: 'A03', title: 'Priprava ponudb', description: 'Iz povpraševanja pripravi osnutek ponudbe po vaših cenah in pravilih. Komercialist ga pregleda in pošlje.' },
];

export const linkedTiles = [
  { code: 'U01', title: 'Za ekipe in oddelke', description: 'Skupna baza znanja, veščine za ponavljajoča se opravila, pravila rabe in izobraževanje ekipe.', href: '/claude-chatgpt-za-ekipe' },
  { code: 'U02', title: 'Za razvijalce', description: 'Postavimo razvojno okolje, v katerem tudi nerazvijalci sami gradijo rešitve z AI, na primer s Claude Code.', href: '/claude-chatgpt-za-ekipe' },
  { code: 'U03', title: 'Delavnica', description: 'Praktična delavnica na resničnih nalogah vaše ekipe. Vsak udeleženec odide z rešitvijo za svoje delo.', href: '/claude-chatgpt-za-ekipe' },
];

export const ctaTile = {
  eyebrow: 'Drugi procesi',
  title: 'Vašega procesa ni na seznamu?',
  description: 'Agente razvijamo tudi za druge procese, vključno s procesi, značilnimi za vašo panogo. Povežemo jih z vašimi obstoječimi poslovnimi aplikacijami.',
};

export const costs = {
  eyebrow: 'Stroški',
  title: 'Dve postavki, obe vnaprej jasni.',
  items: [
    { label: 'Enkratno', title: 'Postavitev', text: 'Analiza, zasnova, povezave z vašimi sistemi in zagon. Fiksna cena, ko poznamo obseg.' },
    { label: 'Mesečno', title: 'Delovanje', text: 'Gostovanje, vzdrževanje, stroški AI modelov in izboljšave. Neobvezno in razčlenjeno po postavkah.' },
  ],
  note: 'Zavezujočo ceno pripravimo po prvem pogovoru. Cene so brez DDV.',
  button: 'Uskladimo postavitev in delovanje',
};

export const faq = [
  { q: 'Ali moram začeti s temelji?', a: 'Ne. Posamezen agent, na primer telefonski, lahko deluje tudi samostojno.' },
  { q: 'Ali lahko združim več delov?', a: 'Da. Na pogovoru skupaj ugotovimo, kaj sodi skupaj.' },
  { q: 'Koliko časa traja postavitev?', a: 'Priprava dokumentov približno en teden, posamezen agent en do dva tedna, programska oprema po meri dlje.' },
];

export const weiler = {
  name: 'Weiler Abrasives',
  tag: 'Proizvodnja · brusilna sredstva · razvojni projekt',
  lead: 'Dveletni razvojni projekt WE-Grind 5.0 (2024–2026) z Weiler Abrasives in Nomnio: pametni brus z vgrajenim senzorjem, ki med brušenjem meri vibracije, z AI izračuna korekcije in operaterja opozori, preden nastane napaka.',
  challenge: [
    'Vibracije med brušenjem slabšajo kakovost površine in hitreje obrabljajo brus, vzrok pa ni bil vedno jasen.',
    'Vibracije zaradi napačnih nastavitev stroja je bilo treba ločiti od vplivov okolice.',
    'Operater ni imel sprotnih opozoril, ko je proces zašel izven dovoljenih mej.',
  ],
  solution: [
    'Senzorji na brusnem stroju v realnem času zajemajo vibracije po oseh X, Y in Z, temperaturo in hitrosti.',
    'Čiščenje podatkov s filtri in strojnim učenjem, ki loči vibracije zaradi nastavitev stroja od šuma iz okolice.',
    'AI modeli napovedujejo obrabo brusa ter izračunajo korekcijske faktorje in pragove glede na tip stroja in merilno os.',
  ],
  kpis: [
    { v: '+35 %', t: 'višji G-faktor brušenja kot pri najboljši konkurenčni rešitvi' },
    { v: '26 %', t: 'manj prašnih delcev v zraku in manj odpadnega materiala v filtrih' },
    { v: 'TRL 9', t: 'sistem potrjen za delo v realnih proizvodnih pogojih' },
  ],
  tags: ['IoT senzorji', 'AI modeli', 'Spletna in mobilna aplikacija'],
};

export const halder = {
  name: 'Halder',
  tag: 'Trgovina · B2B distribucija',
  lead: 'Distributer s številnimi dobavitelji je potreboval eno mesto, kjer se podatki o vseh izdelkih uredijo enkrat in se samodejno prenesejo na spletno stran, v B2B portal in v tujo izpostavo.',
  challenge: [
    'Podatki dobaviteljev so prihajali v različnih oblikah (BMECat, Excel, XML, API) in brez enotne sheme.',
    'Izdelke, prevode in cene so urejali ročno na več mestih.',
  ],
  solution: [
    'Centralna baza produktov z vmesnikom, v kateri se podatki dobaviteljev prečistijo, poenotijo in strukturirajo.',
    'Uvozni moduli za BMECat, Excel, XML in API s samodejno sinhronizacijo.',
  ],
  kpis: [{ v: '[X]', t: '[merilo]' }],
  tags: ['Centralna baza produktov', 'AI prevodi', 'ERP (SAOP)'],
};

export const howWeWork = {
  eyebrow: 'Kako delamo pri Kalmii',
  title: 'Z malimi in srednjimi podjetji delamo postopno in dolgoročno.',
  intro: 'Ne prodamo enega projekta in odidemo. Z vami gradimo korak za korakom in ostanemo, ko AI že dela.',
  items: [
    { title: 'Dolgoročno sodelovanje', text: 'AI ni enkraten projekt. Modeli, orodja in vaši procesi se spreminjajo, zato ostanemo z vami tudi po uvedbi.' },
    { title: 'Postopna uvedba', text: 'En proces, izmerjen rezultat, nato naslednji. Vlagate v tisto, kar je že pokazalo učinek.' },
    { title: 'Najprej temelji', text: 'Procesi, podatki, pravila, povezave in znanje podjetja, preden gradimo agente.' },
    { title: 'Ljudje ostanejo v središču', text: 'Ekipe naučimo delati z AI. Odločitve ostanejo pri ljudeh.' },
  ],
};

export const startSmall = [
  { title: 'Majhno tveganje', text: 'Najprej en proces, izmerjen na vaših podatkih.' },
  { title: 'Hitri rezultati', text: 'Učinek vidite v tednih, ne v letih.' },
  { title: 'Postopna integracija', text: 'Ko proces deluje, ga povežemo z naslednjim.' },
];

export const referenceClients = ['Krka', 'ETI', 'Iskraemeco', 'Kontron', 'Weiler Abrasives', 'IBO GmbH', 'Hypex', 'Cestel', 'ORO Orodjarna', 'GO-ST', 'UVC Solutions', 'Medis', 'Smučarska zveza Slovenije', "Strip's", 'Ilirika', 'ALEMO', 'Extreme Vital', 'Digital Receptionist', 'Slovenia Explorer'];
