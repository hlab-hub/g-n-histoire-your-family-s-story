import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useMemo, useRef, useState } from "react";
import { Upload, Sparkles, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AncestorPanel } from "@/components/AncestorPanel";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import {
  couples,
  historicalEvents,
  people as demoPeople,
  spanOf,
  threeGenerations,
  type Person,
} from "@/lib/family-data";
import { gedcomCoupleColors, parseGedcom } from "@/lib/gedcom";

const FamilyMap = lazy(() => import("@/components/FamilyMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GénéHistoire — Carte & histoire familiale interactive" },
      {
        name: "description",
        content:
          "Explorez votre généalogie sur une carte : trajectoires de vie, couples colorés et frise des grands événements historiques français de 1840 à 1940.",
      },
      { property: "og:title", content: "GénéHistoire — Carte & histoire familiale" },
      {
        property: "og:description",
        content:
          "Cartographie généalogique interactive : import GEDCOM, arcs de trajectoires et contexte historique régional.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [dataset, setDataset] = useState<Person[] | null>(null);
  const [focusId, setFocusId] = useState<string>("marguerite-legall");
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const all = dataset ?? [];
  const visible = useMemo(
    () => (all.length ? threeGenerations(all, focusId) : []),
    [all, focusId],
  );
  const span = useMemo(() => spanOf(visible), [visible]);
  const selected = visible.find((p) => p.id === selectedId);

  const colorOf = (p: Person) =>
    (p.coupleId ? gedcomCoupleColors.get(p.coupleId) : undefined) ??
    couples.find((c) => c.id === p.coupleId)?.color ??
    "#64748b";

  const legend = useMemo(() => {
    const seen = new Map<string, { id: string; label: string; color: string }>();
    for (const p of visible) {
      if (!p.coupleId || seen.has(p.coupleId)) continue;
      const known = couples.find((c) => c.id === p.coupleId);
      seen.set(p.coupleId, {
        id: p.coupleId,
        label: known?.label ?? `Union ${seen.size + 1}`,
        color: colorOf(p),
      });
    }
    return [...seen.values()];
  }, [visible]);

  const loadDemo = () => {
    setDataset(demoPeople);
    setFocusId("marguerite-legall");
    setSelectedId(undefined);
    setStatus("Exemple chargé : 15 individus, 1838 – 1987.");
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { people: parsed, skipped } = parseGedcom(text);
    if (!parsed.length) {
      setStatus("Aucun lieu géolocalisable trouvé dans ce fichier GEDCOM.");
      return;
    }
    setDataset(parsed);
    setFocusId(parsed[parsed.length - 1]!.id);
    setSelectedId(undefined);
    setStatus(
      `${parsed.length} individus importés depuis ${file.name}${skipped ? ` · ${skipped} sans lieu exploitable` : ""}.`,
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="z-[600] flex flex-wrap items-center gap-4 border-b border-border bg-card px-5 py-3 shadow-[var(--shadow-panel)]">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MapPinned className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="font-serif text-lg leading-tight tracking-tight text-foreground">
              GénéHistoire <span className="text-muted-foreground">— Carte & Histoire Familiale</span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Généalogie géographique & contexte historique
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void handleFile(f);
            }}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-2 text-xs transition-colors ${
              dragging
                ? "border-accent bg-accent/15 text-foreground"
                : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Déposez un fichier .ged ou cliquez pour parcourir
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".ged,.gedcom,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <Button onClick={loadDemo} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Charger un exemple (3 générations)
          </Button>
        </div>
        {status && (
          <p className="w-full text-[11px] text-muted-foreground">{status}</p>
        )}
      </header>

      <main className="relative flex-1">
        {all.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="max-w-lg text-center">
              <h2 className="font-serif text-3xl text-foreground">
                Vos ancêtres ont laissé une trace sur la carte.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Importez un fichier GEDCOM, ou chargez la famille d'exemple : trois générations
                françaises entre la Bretagne, la Provence, la Bourgogne et Paris, de 1838 à 1940,
                avec leurs trajectoires de vie et les grands événements qu'elles ont traversés.
              </p>
              <Button onClick={loadDemo} size="lg" className="mt-6 gap-2">
                <Sparkles className="h-4 w-4" />
                Charger un exemple (3 générations)
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ClientOnly fallback={<div className="h-full w-full bg-muted" />}>
              <Suspense fallback={<div className="h-full w-full bg-muted" />}>
                <FamilyMap
                  people={visible}
                  colorOf={colorOf}
                  selectedId={selectedId}
                  hoveredId={hoveredId}
                  onSelect={setSelectedId}
                  events={historicalEvents}
                />
              </Suspense>
            </ClientOnly>

            <AncestorPanel
              all={all}
              visible={visible}
              focusId={focusId}
              onFocus={(id) => {
                setFocusId(id);
                setSelectedId(undefined);
              }}
              selected={selected}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              hoveredId={hoveredId}
              colorOf={colorOf}
              legend={legend}
              events={historicalEvents}
            />

            <HistoryTimeline
              people={visible}
              colorOf={colorOf}
              span={span}
              events={historicalEvents}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={setSelectedId}
              open={timelineOpen}
              onToggle={() => setTimelineOpen((v) => !v)}
            />
          </>
        )}
      </main>
    </div>
  );
}
