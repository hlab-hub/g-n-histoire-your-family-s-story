import type { Person, Place } from "./family-data";

/** Small built-in gazetteer: enough to place most French GEDCOM records. */
const gazetteer: Record<string, Place> = {
  paris: { name: "Paris", region: "Île-de-France", lat: 48.8566, lng: 2.3522 },
  brest: { name: "Brest", region: "Bretagne", lat: 48.3904, lng: -4.4861 },
  quimper: { name: "Quimper", region: "Bretagne", lat: 47.9959, lng: -4.0969 },
  rennes: { name: "Rennes", region: "Bretagne", lat: 48.1173, lng: -1.6778 },
  nantes: { name: "Nantes", region: "Pays de la Loire", lat: 47.2184, lng: -1.5536 },
  vannes: { name: "Vannes", region: "Bretagne", lat: 47.6587, lng: -2.7603 },
  marseille: { name: "Marseille", region: "Provence", lat: 43.2965, lng: 5.3698 },
  avignon: { name: "Avignon", region: "Provence", lat: 43.9493, lng: 4.8055 },
  arles: { name: "Arles", region: "Provence", lat: 43.6768, lng: 4.6278 },
  toulon: { name: "Toulon", region: "Provence", lat: 43.1242, lng: 5.928 },
  nice: { name: "Nice", region: "Provence", lat: 43.7102, lng: 7.262 },
  lyon: { name: "Lyon", region: "Rhône-Alpes", lat: 45.764, lng: 4.8357 },
  grenoble: { name: "Grenoble", region: "Rhône-Alpes", lat: 45.1885, lng: 5.7245 },
  dijon: { name: "Dijon", region: "Bourgogne", lat: 47.322, lng: 5.0415 },
  beaune: { name: "Beaune", region: "Bourgogne", lat: 47.0257, lng: 4.8397 },
  bordeaux: { name: "Bordeaux", region: "Aquitaine", lat: 44.8378, lng: -0.5792 },
  toulouse: { name: "Toulouse", region: "Occitanie", lat: 43.6047, lng: 1.4442 },
  lille: { name: "Lille", region: "Hauts-de-France", lat: 50.6292, lng: 3.0573 },
  strasbourg: { name: "Strasbourg", region: "Alsace", lat: 48.5734, lng: 7.7521 },
  rouen: { name: "Rouen", region: "Normandie", lat: 49.4432, lng: 1.0999 },
  reims: { name: "Reims", region: "Champagne", lat: 49.2583, lng: 4.0317 },
  verdun: { name: "Verdun", region: "Lorraine", lat: 49.1596, lng: 5.3878 },
  limoges: { name: "Limoges", region: "Limousin", lat: 45.8336, lng: 1.2611 },
  clermont: { name: "Clermont-Ferrand", region: "Auvergne", lat: 45.7772, lng: 3.087 },
  turin: { name: "Turin", region: "Piémont", lat: 45.0703, lng: 7.6869 },
  torino: { name: "Turin", region: "Piémont", lat: 45.0703, lng: 7.6869 },
  cuneo: { name: "Cuneo", region: "Piémont", lat: 44.3841, lng: 7.5426 },
  milan: { name: "Milan", region: "Lombardie", lat: 45.4642, lng: 9.19 },
  genes: { name: "Gênes", region: "Ligurie", lat: 44.4056, lng: 8.9463 },
  rome: { name: "Rome", region: "Latium", lat: 41.9028, lng: 12.4964 },
};

function lookupPlace(raw?: string): Place | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    const key = part
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z]/g, "");
    for (const gk of Object.keys(gazetteer)) {
      const hit = gazetteer[gk];
      if (hit && (key === gk || key.startsWith(gk))) {
        return { ...hit, name: parts[0] ?? hit.name };
      }
    }
  }
  return undefined;
}

function yearOf(date?: string) {
  const m = date?.match(/\b(1[5-9]\d{2}|20\d{2})\b/);
  return m ? Number(m[1]) : undefined;
}

type Raw = {
  id: string;
  name?: string;
  sex?: string;
  occu?: string;
  birtDate?: string;
  birtPlac?: string;
  deatDate?: string;
  deatPlac?: string;
  famc?: string;
  fams?: string[];
};

type Fam = { id: string; husb?: string; wife?: string; marrDate?: string; marrPlac?: string };

export type GedcomResult = { people: Person[]; skipped: number };

export function parseGedcom(text: string): GedcomResult {
  const lines = text.split(/\r?\n/);
  const indis: Raw[] = [];
  const fams: Fam[] = [];
  let cur: Raw | Fam | null = null;
  let kind: "INDI" | "FAM" | null = null;
  let ctx = "";

  for (const line of lines) {
    const m = line.match(/^(\d+)\s+(@[^@]+@\s+)?(\w+)\s*(.*)$/);
    if (!m) continue;
    const level = Number(m[1]);
    const pointer = m[2]?.trim();
    const tag = m[3] ?? "";
    const value = (m[4] ?? "").trim();

    if (level === 0) {
      cur = null;
      kind = null;
      ctx = "";
      if (value === "INDI" && pointer) {
        cur = { id: pointer } as Raw;
        kind = "INDI";
        indis.push(cur as Raw);
      } else if (value === "FAM" && pointer) {
        cur = { id: pointer } as Fam;
        kind = "FAM";
        fams.push(cur as Fam);
      }
      continue;
    }
    if (!cur) continue;

    if (kind === "INDI") {
      const p = cur as Raw;
      if (level === 1) {
        ctx = tag;
        if (tag === "NAME") p.name = value.replace(/\//g, "").replace(/\s+/g, " ").trim();
        if (tag === "SEX") p.sex = value;
        if (tag === "OCCU") p.occu = value;
        if (tag === "FAMC") p.famc = value;
        if (tag === "FAMS") p.fams = [...(p.fams ?? []), value];
      } else if (level >= 2) {
        if (ctx === "BIRT" && tag === "DATE") p.birtDate = value;
        if (ctx === "BIRT" && tag === "PLAC") p.birtPlac = value;
        if (ctx === "DEAT" && tag === "DATE") p.deatDate = value;
        if (ctx === "DEAT" && tag === "PLAC") p.deatPlac = value;
        if (ctx === "OCCU" && tag === "PLAC") { /* ignore */ }
      }
    } else if (kind === "FAM") {
      const f = cur as Fam;
      if (level === 1) {
        ctx = tag;
        if (tag === "HUSB") f.husb = value;
        if (tag === "WIFE") f.wife = value;
      } else if (level >= 2 && ctx === "MARR") {
        if (tag === "DATE") f.marrDate = value;
        if (tag === "PLAC") f.marrPlac = value;
      }
    }
  }

  const palette = ["#2563eb", "#b45309", "#0f766e", "#9d174d", "#7c3aed", "#a16207", "#991b1b"];
  const famColor = new Map<string, string>();
  fams.forEach((f, i) => famColor.set(f.id, palette[i % palette.length] ?? "#64748b"));

  const people: Person[] = [];
  let skipped = 0;

  for (const raw of indis) {
    const bp = lookupPlace(raw.birtPlac);
    const by = yearOf(raw.birtDate);
    if (!bp || !by) {
      skipped++;
      continue;
    }
    const childFam = fams.find((f) => f.id === raw.famc);
    const ownFam = fams.find((f) => raw.fams?.includes(f.id));
    const dp = lookupPlace(raw.deatPlac);
    const dy = yearOf(raw.deatDate);
    const mp = lookupPlace(ownFam?.marrPlac);
    const my = yearOf(ownFam?.marrDate);
    const spouse = ownFam ? (ownFam.husb === raw.id ? ownFam.wife : ownFam.husb) : undefined;

    people.push({
      id: raw.id.replace(/@/g, ""),
      name: raw.name ?? "Inconnu",
      sex: raw.sex === "F" ? "F" : "M",
      occupation: raw.occu ?? "Non renseignée",
      birth: { year: by, date: raw.birtDate ?? String(by), place: bp },
      ...(ownFam ? { coupleId: ownFam.id } : {}),
      ...(childFam?.husb ? { fatherId: childFam.husb.replace(/@/g, "") } : {}),
      ...(childFam?.wife ? { motherId: childFam.wife.replace(/@/g, "") } : {}),
      ...(dp && dy ? { death: { year: dy, date: raw.deatDate ?? String(dy), place: dp } } : {}),
      ...(mp && my && spouse
        ? {
            union: {
              year: my,
              date: ownFam?.marrDate ?? String(my),
              place: mp,
              spouseId: spouse.replace(/@/g, ""),
            },
          }
        : {}),
    });
  }

  // Register ad-hoc couple colors on the parsed people via a side map.
  for (const p of people) {
    if (p.coupleId) gedcomCoupleColors.set(p.coupleId, famColor.get(p.coupleId) ?? "#64748b");
  }

  return { people, skipped };
}

export const gedcomCoupleColors = new Map<string, string>();
