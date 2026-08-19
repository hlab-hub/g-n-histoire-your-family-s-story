import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import type { HistoricalEvent, Person } from "@/lib/family-data";
import { Button } from "@/components/ui/button";

type Props = {
  people: Person[];
  colorOf: (p: Person) => string;
  span: [number, number];
  events: HistoricalEvent[];
  hoveredId?: string | undefined;
  selectedId?: string | undefined;
  onHover: (id?: string) => void;
  onSelect: (id: string) => void;
  open: boolean;
  onToggle: () => void;
};

export function HistoryTimeline({
  people,
  colorOf,
  span,
  events,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  open,
  onToggle,
}: Props) {
  const [start, end] = span;
  const pct = (year: number) => ((Math.min(Math.max(year, start), end) - start) / (end - start)) * 100;
  const decades = useMemo(() => {
    const out: number[] = [];
    for (let y = start; y <= end; y += 10) out.push(y);
    return out;
  }, [start, end]);

  const visible = events.filter((e) => (e.endYear ?? e.year) >= start && e.year <= end);
  const highlighted = people.find((p) => p.id === (hoveredId ?? selectedId));

  return (
    <section className="pointer-events-auto absolute inset-x-0 bottom-0 z-[500]">
      <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-border bg-card/95 shadow-[var(--shadow-panel)] backdrop-blur">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
          <div className="flex items-baseline gap-3">
            <h2 className="font-serif text-sm font-semibold tracking-wide text-foreground">
              Frise historique
            </h2>
            <span className="text-xs text-muted-foreground">
              {start} – {end}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="gap-1 text-xs">
            {open ? "Réduire" : "Déployer"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "" : "rotate-180"}`} />
          </Button>
        </header>

        {open && (
          <div className="px-4 pb-4 pt-3">
            <div className="relative h-6 border-b border-dashed border-border">
              {decades.map((y) => (
                <span
                  key={y}
                  className="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
                  style={{ left: `${pct(y)}%` }}
                >
                  {y}
                </span>
              ))}
            </div>

            <div className="relative mt-2 h-20">
              {visible.map((e, i) => {
                const left = pct(e.year);
                const width = Math.max(pct(e.endYear ?? e.year) - left, 0.6);
                const row = i % 3;
                const inLife =
                  highlighted &&
                  (e.endYear ?? e.year) >= highlighted.birth.year &&
                  e.year <= (highlighted.death?.year ?? highlighted.birth.year + 70);
                return (
                  <div
                    key={e.title}
                    title={`${e.title} — ${e.description}`}
                    className={`group absolute h-5 rounded-sm border px-1.5 text-[10px] leading-5 transition-all ${
                      inLife
                        ? "border-accent bg-accent/25 text-foreground"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                    style={{ left: `${left}%`, width: `${width}%`, top: row * 26, minWidth: 10 }}
                  >
                    <span className="whitespace-nowrap font-medium">{e.title}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 max-h-32 space-y-1 overflow-y-auto border-t border-border pt-2 pr-2">
              {people.map((p) => {
                const from = pct(p.birth.year);
                const to = pct(p.death?.year ?? p.birth.year + 70);
                const active = hoveredId === p.id || selectedId === p.id;
                return (
                  <div
                    key={p.id}
                    className="group relative flex h-5 cursor-pointer items-center"
                    onMouseEnter={() => onHover(p.id)}
                    onMouseLeave={() => onHover(undefined)}
                    onClick={() => onSelect(p.id)}
                  >
                    <div
                      className="absolute h-2 rounded-full transition-all"
                      style={{
                        left: `${from}%`,
                        width: `${Math.max(to - from, 0.5)}%`,
                        background: colorOf(p),
                        opacity: active ? 1 : 0.45,
                        height: active ? 10 : 8,
                      }}
                    />
                    <span
                      className="absolute whitespace-nowrap text-[10px] text-foreground"
                      style={{ left: `calc(${to}% + 8px)`, opacity: active ? 1 : 0.6 }}
                    >
                      {p.name} · {p.birth.year}–{p.death?.year ?? "?"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
