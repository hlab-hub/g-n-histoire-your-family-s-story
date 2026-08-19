import { useEffect, useState } from "react";
import { Users, MapPin, Milestone, Cross, Heart, Baby, GitBranch, Pencil } from "lucide-react";
import type { Person } from "@/lib/family-data";
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
  onUpdate: (id: string, patch: Partial<Person>) => void;
};

/** Click-to-edit inline text. */
function Editable({
  value,
  onChange,
  className = "",
  placeholder = "—",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className={`w-full rounded-sm border border-accent bg-background px-1 py-0.5 outline-none ${className}`}
      />
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      title="Cliquer pour modifier"
      className={`group/edit w-full rounded-sm px-1 py-0.5 text-left hover:bg-muted ${className}`}
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
      <Pencil className="ml-1 inline h-2.5 w-2.5 align-baseline text-muted-foreground opacity-0 group-hover/edit:opacity-100" />
    </button>
  );
}

function RelationLink({
  person,
  color,
  onSelect,
  onHover,
}: {
  person: Person;
  color: string;
  onSelect: (id: string) => void;
  onHover: (id?: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(person.id)}
      onMouseEnter={() => onHover(person.id)}
      onMouseLeave={() => onHover(undefined)}
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-foreground underline decoration-dotted underline-offset-2 hover:bg-secondary"
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {person.name}
      <span className="tabular-nums text-muted-foreground">{person.birth.year}</span>
    </button>
  );
}

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
  onUpdate,
}: Props) {
  const focus = all.find((p) => p.id === focusId);
  const person = selected ?? focus;

  const spouse = person?.union?.spouseId
    ? all.find((p) => p.id === person.union!.spouseId)
    : undefined;
  const siblings = person
    ? all.filter(
        (p) =>
          p.id !== person.id &&
          ((person.fatherId && p.fatherId === person.fatherId) ||
            (person.motherId && p.motherId === person.motherId)),
      )
    : [];
  const children = person
    ? all.filter((p) => p.fatherId === person.id || p.motherId === person.id)
    : [];

  const set = (patch: Partial<Person>) => person && onUpdate(person.id, patch);

  return (
    <aside className="pointer-events-auto absolute left-3 top-3 z-[500] flex max-h-[calc(100vh-12rem)] w-[22rem] flex-col overflow-hidden rounded-xl border border-border bg-card/95 shadow-[var(--shadow-panel)] backdrop-blur">
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
              <h3 className="font-serif text-xl leading-tight text-foreground">
                <Editable value={person.name} onChange={(v) => set({ name: v })} />
              </h3>
              <p className="text-xs italic text-accent-foreground">
                <Editable
                  value={person.occupation}
                  onChange={(v) => set({ occupation: v })}
                  placeholder="Profession"
                />
              </p>

              <dl className="mt-3 space-y-2 text-xs">
                <EventRow
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Naissance"
                  date={person.birth.date}
                  place={person.birth.place.name}
                  year={person.birth.year}
                  onDate={(v) => set({ birth: { ...person.birth, date: v } })}
                  onPlace={(v) =>
                    set({ birth: { ...person.birth, place: { ...person.birth.place, name: v } } })
                  }
                  onYear={(v) => set({ birth: { ...person.birth, year: v } })}
                />
                {person.union && (
                  <EventRow
                    icon={<Milestone className="h-3.5 w-3.5" />}
                    label="Mariage"
                    date={person.union.date}
                    place={person.union.place.name}
                    year={person.union.year}
                    onDate={(v) => set({ union: { ...person.union!, date: v } })}
                    onPlace={(v) =>
                      set({
                        union: { ...person.union!, place: { ...person.union!.place, name: v } },
                      })
                    }
                    onYear={(v) => set({ union: { ...person.union!, year: v } })}
                  />
                )}
                {person.residence && (
                  <EventRow
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    label="Résidence"
                    place={person.residence.place.name}
                    year={person.residence.year}
                    onPlace={(v) =>
                      set({
                        residence: {
                          ...person.residence!,
                          place: { ...person.residence!.place, name: v },
                        },
                      })
                    }
                    onYear={(v) => set({ residence: { ...person.residence!, year: v } })}
                  />
                )}
                {person.death && (
                  <EventRow
                    icon={<Cross className="h-3.5 w-3.5" />}
                    label="Décès"
                    date={person.death.date}
                    place={person.death.place.name}
                    year={person.death.year}
                    onDate={(v) => set({ death: { ...person.death!, date: v } })}
                    onPlace={(v) =>
                      set({
                        death: { ...person.death!, place: { ...person.death!.place, name: v } },
                      })
                    }
                    onYear={(v) => set({ death: { ...person.death!, year: v } })}
                  />
                )}
              </dl>

              <div className="mt-3 space-y-2">
                {spouse && (
                  <Relations
                    icon={<Heart className="h-3 w-3" />}
                    label="Conjoint"
                    list={[spouse]}
                    colorOf={colorOf}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                )}
                {siblings.length > 0 && (
                  <Relations
                    icon={<GitBranch className="h-3 w-3" />}
                    label="Frères & sœurs"
                    list={siblings}
                    colorOf={colorOf}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                )}
                {children.length > 0 && (
                  <Relations
                    icon={<Baby className="h-3 w-3" />}
                    label="Enfants"
                    list={children}
                    colorOf={colorOf}
                    onSelect={onSelect}
                    onHover={onHover}
                  />
                )}
              </div>

              <div className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-muted-foreground">
                <Editable
                  value={person.note ?? ""}
                  onChange={(v) => set({ note: v })}
                  placeholder="Ajouter une note…"
                />
              </div>
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

function Relations({
  icon,
  label,
  list,
  colorOf,
  onSelect,
  onHover,
}: {
  icon: React.ReactNode;
  label: string;
  list: Person[];
  colorOf: (p: Person) => string;
  onSelect: (id: string) => void;
  onHover: (id?: string) => void;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-0.5 flex flex-wrap gap-1">
        {list.map((p) => (
          <RelationLink
            key={p.id}
            person={p}
            color={colorOf(p)}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </div>
  );
}

function EventRow({
  icon,
  label,
  date,
  place,
  year,
  onDate,
  onPlace,
  onYear,
}: {
  icon: React.ReactNode;
  label: string;
  date?: string;
  place: string;
  year: number;
  onDate?: (v: string) => void;
  onPlace: (v: string) => void;
  onYear: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 text-accent-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="text-foreground">
          {onDate && date !== undefined ? (
            <Editable value={date} onChange={onDate} placeholder="Date" />
          ) : (
            <Editable
              value={String(year)}
              onChange={(v) => onYear(Number(v) || year)}
              placeholder="Année"
            />
          )}
          <Editable value={place} onChange={onPlace} placeholder="Lieu" />
        </dd>
      </div>
    </div>
  );
}
