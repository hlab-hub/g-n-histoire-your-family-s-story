import { Users, MapPin, Milestone, Cross } from "lucide-react";
import type { HistoricalEvent, Person } from "@/lib/family-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type Props = {
  all: Person[];
  visible: Person[];
  focusId: string;
  onFocus: (id: string) => void;
  selected?: Person | undefined;
  onSelect: (id: string) => void;
  onHover: (id?: string) => void;
  hoveredId?: string | undefined;
  colorOf: (p: Person) => string;
  legend: { id: string; label: string; color: string }[];
  events: HistoricalEvent[];
};

export function AncestorPanel({
  all,
  visible,
  focusId,
  onFocus,
  selected,
  onSelect,
  onHover,
  hoveredId,
  colorOf,
  legend,
  events,
}: Props) {
  const focus = all.find((p) => p.id === focusId);
  const person = selected ?? focus;
  const context = person
    ? events
        .filter(
          (e) =>
            (e.endYear ?? e.year) >= person.birth.year &&
            e.year <= (person.death?.year ?? person.birth.year + 70),
        )
        .slice(0, 4)
    : [];

  return (
    <aside className="pointer-events-auto absolute left-3 top-3 z-[500] flex max-h-[calc(100vh-15rem)] w-[22rem] flex-col overflow-hidden rounded-xl border border-border bg-card/95 shadow-[var(--shadow-panel)] backdrop-blur">
      <div className="border-b border-border px-4 py-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Individu de référence
        </p>
        <Select value={focusId} onValueChange={onFocus}>
          <SelectTrigger className="mt-2 w-full font-serif">
            <SelectValue placeholder="Choisir un individu" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {all.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.birth.year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />3 générations autour de{" "}
          <span className="font-medium text-foreground">{focus?.name}</span>
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 py-3">
          {person && (
            <article>
              <h3 className="font-serif text-xl leading-tight text-foreground">{person.name}</h3>
              <p className="text-xs italic text-accent-foreground">{person.occupation}</p>
              <dl className="mt-3 space-y-2 text-xs">
                <Row
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Naissance"
                  value={`${person.birth.date} · ${person.birth.place.name} (${person.birth.place.region})`}
                />
                {person.union && (
                  <Row
                    icon={<Milestone className="h-3.5 w-3.5" />}
                    label="Mariage"
                    value={`${person.union.date} · ${person.union.place.name}`}
                  />
                )}
                {person.residence && (
                  <Row
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Résidence"
                    value={`${person.residence.year} · ${person.residence.place.name}`}
                  />
                )}
                {person.death && (
                  <Row
                    icon={<Cross className="h-3.5 w-3.5" />}
                    label="Décès"
                    value={`${person.death.date} · ${person.death.place.name}`}
                  />
                )}
              </dl>
              {person.note && (
                <p className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted-foreground">
                  {person.note}
                </p>
              )}
              {context.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    Contexte vécu
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-foreground">
                    {context.map((e) => (
                      <li key={e.title}>
                        <span className="tabular-nums text-muted-foreground">
                          {e.year}
                          {e.endYear ? `–${e.endYear}` : ""}
                        </span>{" "}
                        {e.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          )}

          <Separator className="my-4" />

          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Ancêtres affichés
          </p>
          <ul className="mt-2 space-y-1">
            {visible.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onSelect(p.id)}
                  onMouseEnter={() => onHover(p.id)}
                  onMouseLeave={() => onHover(undefined)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                    hoveredId === p.id || selected?.id === p.id ? "bg-secondary" : "hover:bg-muted"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: colorOf(p) }}
                  />
                  <span className="truncate text-foreground">{p.name}</span>
                  <span className="ml-auto tabular-nums text-muted-foreground">
                    {p.birth.year}–{p.death?.year ?? "?"}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Légende des couples
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {legend.map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <span className="h-1.5 w-6 rounded-full" style={{ background: c.color }} />
                <span className="text-muted-foreground">{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </ScrollArea>
    </aside>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-accent-foreground">{icon}</span>
      <div>
        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="text-foreground">{value}</dd>
      </div>
    </div>
  );
}
