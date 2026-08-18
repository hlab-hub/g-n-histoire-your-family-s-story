export type Place = {
  name: string;
  region: string;
  lat: number;
  lng: number;
};

export type Person = {
  id: string;
  name: string;
  sex: "M" | "F";
  occupation: string;
  birth: { year: number; date: string; place: Place };
  death?: { year: number; date: string; place: Place };
  union?: { year: number; date: string; place: Place; spouseId: string };
  residence?: { year: number; place: Place };
  fatherId?: string;
  motherId?: string;
  coupleId?: string;
  note?: string;
};

export type Couple = { id: string; label: string; color: string };

export const couples: Couple[] = [
  { id: "c-legall", label: "Le Gall — Cariou (Bretagne)", color: "#2563eb" },
  { id: "c-rambert", label: "Rambert — Blanc (Provence)", color: "#b45309" },
  { id: "c-moreau", label: "Moreau — Chapuis (Bourgogne)", color: "#0f766e" },
  { id: "c-fournier", label: "Fournier — Berthet (Rhône-Alpes)", color: "#9d174d" },
  { id: "c-parents-1", label: "Le Gall — Rambert (Paris)", color: "#7c3aed" },
  { id: "c-parents-2", label: "Moreau — Fournier (Lyon)", color: "#a16207" },
  { id: "c-focus", label: "Le Gall — Moreau (Paris)", color: "#991b1b" },
];

const P = (name: string, region: string, lat: number, lng: number): Place => ({
  name,
  region,
  lat,
  lng,
});

const places = {
  brest: P("Brest", "Bretagne", 48.3904, -4.4861),
  douarnenez: P("Douarnenez", "Bretagne", 48.0925, -4.3286),
  quimper: P("Quimper", "Bretagne", 47.9959, -4.0969),
  vannes: P("Vannes", "Bretagne", 47.6587, -2.7603),
  marseille: P("Marseille", "Provence", 43.2965, 5.3698),
  avignon: P("Avignon", "Provence", 43.9493, 4.8055),
  aix: P("Aix-en-Provence", "Provence", 43.5297, 5.4474),
  arles: P("Arles", "Provence", 43.6768, 4.6278),
  paris: P("Paris", "Île-de-France", 48.8566, 2.3522),
  beaune: P("Beaune", "Bourgogne", 47.0257, 4.8397),
  macon: P("Mâcon", "Bourgogne", 46.3062, 4.8287),
  dijon: P("Dijon", "Bourgogne", 47.322, 5.0415),
  lyon: P("Lyon", "Rhône-Alpes", 45.764, 4.8357),
  stetienne: P("Saint-Étienne", "Rhône-Alpes", 45.4397, 4.3872),
  grenoble: P("Grenoble", "Rhône-Alpes", 45.1885, 5.7245),
  verdun: P("Verdun", "Lorraine", 49.1596, 5.3878),
};

export const people: Person[] = [
  // Génération I — 1838-1849
  {
    id: "louis-legall",
    name: "Louis Le Gall",
    sex: "M",
    occupation: "Charpentier de marine",
    coupleId: "c-legall",
    birth: { year: 1842, date: "14 mars 1842", place: places.brest },
    union: { year: 1868, date: "9 juin 1868", place: places.douarnenez, spouseId: "anne-cariou" },
    residence: { year: 1870, place: places.quimper },
    death: { year: 1911, date: "2 février 1911", place: places.quimper },
    note: "Employé à l'arsenal de Brest avant l'installation de la famille à Quimper.",
  },
  {
    id: "anne-cariou",
    name: "Anne Cariou",
    sex: "F",
    occupation: "Sardinière",
    coupleId: "c-legall",
    birth: { year: 1846, date: "27 août 1846", place: places.douarnenez },
    union: { year: 1868, date: "9 juin 1868", place: places.douarnenez, spouseId: "louis-legall" },
    death: { year: 1919, date: "11 janvier 1919", place: places.quimper },
    note: "Travaillait en conserverie durant l'essor de la sardine à Douarnenez.",
  },
  {
    id: "honore-rambert",
    name: "Honoré Rambert",
    sex: "M",
    occupation: "Négociant en huile d'olive",
    coupleId: "c-rambert",
    birth: { year: 1844, date: "3 mai 1844", place: places.marseille },
    union: { year: 1871, date: "18 octobre 1871", place: places.avignon, spouseId: "josephine-blanc" },
    residence: { year: 1874, place: places.aix },
    death: { year: 1908, date: "21 novembre 1908", place: places.aix },
  },
  {
    id: "josephine-blanc",
    name: "Joséphine Blanc",
    sex: "F",
    occupation: "Couturière",
    coupleId: "c-rambert",
    birth: { year: 1849, date: "8 juillet 1849", place: places.avignon },
    union: { year: 1871, date: "18 octobre 1871", place: places.avignon, spouseId: "honore-rambert" },
    death: { year: 1922, date: "4 avril 1922", place: places.arles },
  },
  {
    id: "jacques-moreau",
    name: "Jacques Moreau",
    sex: "M",
    occupation: "Tonnelier",
    coupleId: "c-moreau",
    birth: { year: 1838, date: "22 janvier 1838", place: places.beaune },
    union: { year: 1865, date: "5 mai 1865", place: places.macon, spouseId: "rose-chapuis" },
    residence: { year: 1867, place: places.dijon },
    death: { year: 1901, date: "30 septembre 1901", place: places.dijon },
    note: "Sa tonnellerie souffrit de la crise du phylloxéra des années 1870-1880.",
  },
  {
    id: "rose-chapuis",
    name: "Rose Chapuis",
    sex: "F",
    occupation: "Vigneronne",
    coupleId: "c-moreau",
    birth: { year: 1841, date: "16 novembre 1841", place: places.macon },
    union: { year: 1865, date: "5 mai 1865", place: places.macon, spouseId: "jacques-moreau" },
    death: { year: 1913, date: "7 juin 1913", place: places.dijon },
  },
  {
    id: "emile-fournier",
    name: "Émile Fournier",
    sex: "M",
    occupation: "Mineur puis contremaître",
    coupleId: "c-fournier",
    birth: { year: 1840, date: "12 février 1840", place: places.stetienne },
    union: { year: 1866, date: "23 avril 1866", place: places.grenoble, spouseId: "marie-berthet" },
    residence: { year: 1869, place: places.lyon },
    death: { year: 1897, date: "19 décembre 1897", place: places.lyon },
  },
  {
    id: "marie-berthet",
    name: "Marie Berthet",
    sex: "F",
    occupation: "Gantière",
    coupleId: "c-fournier",
    birth: { year: 1843, date: "1er septembre 1843", place: places.grenoble },
    union: { year: 1866, date: "23 avril 1866", place: places.grenoble, spouseId: "emile-fournier" },
    death: { year: 1916, date: "28 mars 1916", place: places.lyon },
  },

  // Génération II — 1868-1876
  {
    id: "yves-legall",
    name: "Yves Le Gall",
    sex: "M",
    occupation: "Cheminot",
    coupleId: "c-parents-1",
    fatherId: "louis-legall",
    motherId: "anne-cariou",
    birth: { year: 1872, date: "5 avril 1872", place: places.quimper },
    union: { year: 1898, date: "12 septembre 1898", place: places.paris, spouseId: "celestine-rambert" },
    residence: { year: 1896, place: places.paris },
    death: { year: 1934, date: "17 mai 1934", place: places.paris },
    note: "Monté à Paris avec le développement du réseau ferroviaire de l'Ouest.",
  },
  {
    id: "celestine-rambert",
    name: "Célestine Rambert",
    sex: "F",
    occupation: "Modiste",
    coupleId: "c-parents-1",
    fatherId: "honore-rambert",
    motherId: "josephine-blanc",
    birth: { year: 1876, date: "30 juin 1876", place: places.aix },
    union: { year: 1898, date: "12 septembre 1898", place: places.paris, spouseId: "yves-legall" },
    death: { year: 1941, date: "9 août 1941", place: places.paris },
  },
  {
    id: "paul-moreau",
    name: "Paul Moreau",
    sex: "M",
    occupation: "Ingénieur civil",
    coupleId: "c-parents-2",
    fatherId: "jacques-moreau",
    motherId: "rose-chapuis",
    birth: { year: 1868, date: "2 octobre 1868", place: places.dijon },
    union: { year: 1895, date: "6 juillet 1895", place: places.lyon, spouseId: "adele-fournier" },
    death: { year: 1929, date: "14 janvier 1929", place: places.lyon },
  },
  {
    id: "adele-fournier",
    name: "Adèle Fournier",
    sex: "F",
    occupation: "Institutrice",
    coupleId: "c-parents-2",
    fatherId: "emile-fournier",
    motherId: "marie-berthet",
    birth: { year: 1870, date: "25 mai 1870", place: places.lyon },
    union: { year: 1895, date: "6 juillet 1895", place: places.lyon, spouseId: "paul-moreau" },
    death: { year: 1948, date: "3 mars 1948", place: places.lyon },
    note: "Formée sous les lois Ferry, elle enseigna quarante ans à Lyon.",
  },

  // Génération III — 1898-1900
  {
    id: "marguerite-legall",
    name: "Marguerite Le Gall",
    sex: "F",
    occupation: "Infirmière",
    coupleId: "c-focus",
    fatherId: "yves-legall",
    motherId: "celestine-rambert",
    birth: { year: 1900, date: "19 février 1900", place: places.paris },
    union: { year: 1921, date: "4 juin 1921", place: places.paris, spouseId: "etienne-moreau" },
    death: { year: 1987, date: "12 octobre 1987", place: places.aix },
    note: "Infirmière volontaire pendant la Grande Guerre, retirée en Provence.",
  },
  {
    id: "etienne-moreau",
    name: "Étienne Moreau",
    sex: "M",
    occupation: "Typographe",
    coupleId: "c-focus",
    fatherId: "paul-moreau",
    motherId: "adele-fournier",
    birth: { year: 1898, date: "8 décembre 1898", place: places.lyon },
    union: { year: 1921, date: "4 juin 1921", place: places.paris, spouseId: "marguerite-legall" },
    residence: { year: 1919, place: places.paris },
    death: { year: 1972, date: "26 juillet 1972", place: places.paris },
    note: "Mobilisé en 1917, blessé près de Verdun.",
  },
  {
    id: "jean-legall",
    name: "Jean Le Gall",
    sex: "M",
    occupation: "Marin d'État",
    fatherId: "yves-legall",
    motherId: "celestine-rambert",
    birth: { year: 1902, date: "3 mars 1902", place: places.paris },
    death: { year: 1917, date: "21 avril 1917", place: places.verdun },
    note: "Mort au front à quinze ans d'âge déclaré faussement majoré.",
  },
];

export type HistoricalEvent = {
  year: number;
  endYear?: number;
  title: string;
  scope: "National" | "Régional" | "Société";
  region?: string;
  description: string;
};

export const historicalEvents: HistoricalEvent[] = [
  {
    year: 1848,
    title: "Révolution de 1848",
    scope: "National",
    description: "Chute de la Monarchie de Juillet, IIe République et suffrage universel masculin.",
  },
  {
    year: 1852,
    endYear: 1870,
    title: "Second Empire",
    scope: "National",
    description: "Industrialisation, grands travaux et expansion du réseau ferroviaire.",
  },
  {
    year: 1860,
    endYear: 1900,
    title: "Exode rural",
    scope: "Société",
    description: "Départ massif des campagnes vers Paris, Lyon et Marseille.",
  },
  {
    year: 1870,
    endYear: 1871,
    title: "Guerre franco-prussienne",
    scope: "National",
    description: "Défaite de Sedan, siège de Paris et proclamation de la IIIe République.",
  },
  {
    year: 1871,
    title: "Commune de Paris",
    scope: "Régional",
    region: "Île-de-France",
    description: "Insurrection parisienne écrasée durant la Semaine sanglante.",
  },
  {
    year: 1875,
    endYear: 1890,
    title: "Crise du phylloxéra",
    scope: "Régional",
    region: "Bourgogne",
    description: "Le vignoble français ravagé ; tonneliers et vignerons ruinés.",
  },
  {
    year: 1880,
    endYear: 1882,
    title: "Lois Ferry",
    scope: "National",
    description: "École primaire gratuite, laïque et obligatoire.",
  },
  {
    year: 1880,
    endYear: 1914,
    title: "Âge d'or de la sardine",
    scope: "Régional",
    region: "Bretagne",
    description: "Conserveries bretonnes en plein essor, puis crises de pêche répétées.",
  },
  {
    year: 1889,
    title: "Exposition universelle",
    scope: "Régional",
    region: "Île-de-France",
    description: "Inauguration de la tour Eiffel à Paris.",
  },
  {
    year: 1894,
    endYear: 1906,
    title: "Affaire Dreyfus",
    scope: "National",
    description: "Crise politique qui divise durablement la société française.",
  },
  {
    year: 1914,
    endYear: 1918,
    title: "Première Guerre mondiale",
    scope: "National",
    description: "1,4 million de morts français ; mobilisation de toutes les régions.",
  },
  {
    year: 1916,
    title: "Bataille de Verdun",
    scope: "Régional",
    region: "Lorraine",
    description: "Dix mois de combats, symbole du sacrifice de la génération 1900.",
  },
  {
    year: 1929,
    endYear: 1935,
    title: "Grande Dépression",
    scope: "National",
    description: "Crise économique tardive mais durable en France.",
  },
  {
    year: 1939,
    endYear: 1945,
    title: "Seconde Guerre mondiale",
    scope: "National",
    description: "Occupation, rationnement et Libération.",
  },
];

export function personById(list: Person[], id?: string) {
  return list.find((p) => p.id === id);
}

/** Focus person + ancestors (parents, grandparents) + spouses of that set. */
export function threeGenerations(list: Person[], focusId: string): Person[] {
  const byId = new Map(list.map((p) => [p.id, p]));
  const picked = new Map<string, Person>();
  const add = (p?: Person) => p && picked.set(p.id, p);

  const walk = (id: string | undefined, depth: number) => {
    const p = id ? byId.get(id) : undefined;
    if (!p || depth > 2) return;
    add(p);
    walk(p.fatherId, depth + 1);
    walk(p.motherId, depth + 1);
  };
  walk(focusId, 0);

  for (const p of [...picked.values()]) {
    if (p.union?.spouseId) add(byId.get(p.union.spouseId));
  }
  return [...picked.values()].sort((a, b) => a.birth.year - b.birth.year);
}

export function generationOf(list: Person[], focusId: string, id: string): number {
  const byId = new Map(list.map((p) => [p.id, p]));
  const seen = new Map<string, number>();
  const walk = (pid: string | undefined, d: number) => {
    const p = pid ? byId.get(pid) : undefined;
    if (!p || d > 3) return;
    if (!seen.has(p.id)) seen.set(p.id, d);
    walk(p.fatherId, d + 1);
    walk(p.motherId, d + 1);
    if (p.union?.spouseId && !seen.has(p.union.spouseId)) seen.set(p.union.spouseId, d);
  };
  walk(focusId, 0);
  return seen.get(id) ?? 0;
}

export function coupleColor(person: Person): string {
  return couples.find((c) => c.id === person.coupleId)?.color ?? "#64748b";
}

export function spanOf(list: Person[]): [number, number] {
  if (!list.length) return [1840, 1940];
  const min = Math.min(...list.map((p) => p.birth.year));
  const max = Math.max(...list.map((p) => p.death?.year ?? p.birth.year + 70));
  return [Math.floor((min - 10) / 10) * 10, Math.ceil((max + 10) / 10) * 10];
}
