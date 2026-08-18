import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from "react-leaflet";
import { Fragment, useEffect, useMemo } from "react";
import type { Person, HistoricalEvent } from "@/lib/family-data";

type Props = {
  people: Person[];
  colorOf: (p: Person) => string;
  selectedId?: string | undefined;
  hoveredId?: string | undefined;
  onSelect: (id: string) => void;
  events: HistoricalEvent[];
};

type LatLng = [number, number];

/** Quadratic bezier arc between two points, bulging perpendicular to the chord. */
function arc(from: LatLng, to: LatLng, bend = 0.22): LatLng[] {
  const [y1, x1] = from;
  const [y2, x2] = to;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx = mx - dy * bend;
  const cy = my + dx * bend;
  const pts: LatLng[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const k = (1 - t) ** 2;
    const l = 2 * (1 - t) * t;
    const m = t ** 2;
    pts.push([k * y1 + l * cy + m * y2, k * x1 + l * cx + m * x2]);
  }
  return pts;
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points as [number, number][], { padding: [90, 90], maxZoom: 7 });
    }
  }, [map, JSON.stringify(points)]);
  return null;
}

function contextFor(person: Person, events: HistoricalEvent[]) {
  const from = person.birth.year;
  const to = person.death?.year ?? from + 70;
  return events
    .filter((e) => (e.endYear ?? e.year) >= from && e.year <= to)
    .filter((e) => !e.region || [person.birth.place.region, person.death?.place.region].includes(e.region))
    .slice(0, 3);
}

export default function FamilyMap({
  people,
  colorOf,
  selectedId,
  hoveredId,
  onSelect,
  events,
}: Props) {
  const points = useMemo<LatLng[]>(
    () =>
      people.flatMap((p) =>
        [p.birth.place, p.union?.place, p.residence?.place, p.death?.place]
          .filter(Boolean)
          .map((pl) => [pl!.lat, pl!.lng] as LatLng),
      ),
    [people],
  );

  return (
    <MapContainer
      center={[46.6, 2.4]}
      zoom={6}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
      style={{ background: "var(--color-background)" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap, &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
      />
      <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png" />
      <FitBounds points={points} />

      {people.map((p) => {
        const color = colorOf(p);
        const active = hoveredId === p.id || selectedId === p.id;
        const legs: LatLng[][] = [];
        const stops = [p.birth.place, p.union?.place, p.residence?.place, p.death?.place].filter(
          Boolean,
        ) as { lat: number; lng: number }[];
        for (let i = 0; i < stops.length - 1; i++) {
          const a = stops[i]!;
          const b = stops[i + 1]!;
          if (a.lat === b.lat && a.lng === b.lng) continue;
          legs.push(arc([a.lat, a.lng], [b.lat, b.lng], 0.18 + i * 0.06));
        }
        return (
          <Fragment key={p.id}>
            {legs.map((leg, i) => (
              <Polyline
                key={`${p.id}-leg-${i}`}
                positions={leg}
                pathOptions={{
                  color,
                  weight: active ? 3.2 : 1.6,
                  opacity: active ? 0.95 : 0.42,
                  dashArray: i === legs.length - 1 && p.death ? "6 6" : undefined,
                }}
              />
            ))}
            <CircleMarker
              center={[p.birth.place.lat, p.birth.place.lng]}
              radius={active ? 11 : 7.5}
              pathOptions={{
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: active ? 0.9 : 0.6,
              }}
              eventHandlers={{ click: () => onSelect(p.id) }}
            >
              <Popup>
                <div className="min-w-56 font-sans">
                  <p className="font-serif text-base font-semibold text-[#1E293B]">{p.name}</p>
                  <p className="text-xs italic text-[#6b6257]">{p.occupation}</p>
                  <dl className="mt-2 space-y-1 text-xs text-[#3b3730]">
                    <div>
                      <span className="font-semibold">Naissance :</span> {p.birth.date} —{" "}
                      {p.birth.place.name}
                    </div>
                    {p.union && (
                      <div>
                        <span className="font-semibold">Mariage :</span> {p.union.date} —{" "}
                        {p.union.place.name}
                      </div>
                    )}
                    {p.death && (
                      <div>
                        <span className="font-semibold">Décès :</span> {p.death.date} —{" "}
                        {p.death.place.name}
                      </div>
                    )}
                  </dl>
                  <div className="mt-2 border-t border-[#e3dccd] pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-[#8a7a5c]">
                      Contexte historique
                    </p>
                    <ul className="mt-1 space-y-0.5 text-xs text-[#3b3730]">
                      {contextFor(p, events).map((e) => (
                        <li key={e.title}>
                          {e.year}
                          {e.endYear ? `–${e.endYear}` : ""} · {e.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
            {p.death && (
              <CircleMarker
                center={[p.death.place.lat, p.death.place.lng]}
                radius={active ? 5.5 : 3.5}
                pathOptions={{ color, weight: 1.5, fillColor: "#FDFBF7", fillOpacity: 1 }}
              />
            )}
          </Fragment>
        );
      })}
    </MapContainer>
  );
}
