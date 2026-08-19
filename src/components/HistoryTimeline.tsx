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

/** Events overlaid directly on each life bar keep the frieze compact. */
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
  const pct = (year: number) =>
    ((Math.min(Math.max(year, start), end) - start) / (end - start)) * 100;
  const decades = useMemo(() => {
    const out: number[] = [];
    for (let y = start; y <= end; y += 10) out.push(y);
    return out;
  }, [start, end]);

  const visible = events.filter((e) => (e.endYear ?? e.year) >= start && e.year <= end);

  return (
    <section className="pointer-events-auto absolute inset-x-0 bottom-0 z-[500]">
      <div className="mx-3 mb-3 overflow-hidden rounded-xl border border-border bg-card/95 shadow-[var(--shadow-panel)] backdrop-blur">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-1.5">
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
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? "" : "rotate-180"}`}
            />
          </Button>
        </header>

        {open && (
          <div className="px-4 pb-3 pt-2">
            <div className="relative h-4 border-b border-dashed border-border">
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

            <div className="relative mt-1 max-h-40 space-y-0.5 overflow-y-auto pr-2">
              {/* vertical guides for period events */}
              {people.map((p) => {
                const from = pct(p.birth.year);
                const to = pct(p.death?.year ?? p.birth.year + 70);
                const active = hoveredId === p.id || selectedId === p.id;
                const lived = visible.filter(
                  (e) =>
                    (e.endYear ?? e.year) >= p.birth.year &&
                    e.year <= (p.death?.year ?? p.birth.year + 70) &&
                    (!e.region ||
                      [p.birth.place.region, p.residence?.place.region, p.death?.place.region].includes(
                        e.region,
                      )),
                );
                return (
                  <div
                    key={p.id}
                    className="group relative flex h-6 cursor-pointer items-center rounded-sm hover:bg-muted/60"
                    onMouseEnter={() => onHover(p.id)}
                    onMouseLeave={() => onHover(undefined)}
                    onClick={() => onSelect(p.id)}
                  >
                    <div
                      className="absolute rounded-full transition-all"
                      style={{
                        left: `${from}%`,
                        width: `${Math.max(to - from, 0.5)}%`,
                        background: colorOf(p),
                        opacity: active ? 1 : 0.4,
                        height: active ? 10 : 8,
                      }}
                    />
                    {lived.map((e) => {
                      const left = pct(e.year);
                      const width = Math.max(pct(e.endYear ?? e.year) - left, 0.35);
                      return (
                        <div
                          key={`${p.id}-${e.title}`}
                          title={`${e.year}${e.endYear ? `–${e.endYear}` : ""} · ${e.title} — ${e.description}`}
                          className="absolute top-1/2 -translate-y-1/2 overflow-hidden rounded-[2px] border border-accent/70 bg-accent/30 px-0.5 text-[9px] leading-[14px] text-foreground"
                          style={{ left: `${left}%`, width: `${width}%`, height: 14 }}
                        >
                          <span className="whitespace-nowrap">{e.title}</span>
                        </div>
                      );
                    })}
                    <span
                      className="absolute whitespace-nowrap text-[10px] font-medium text-foreground"
                      style={{ left: `calc(${to}% + 8px)`, opacity: active ? 1 : 0.7 }}
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
