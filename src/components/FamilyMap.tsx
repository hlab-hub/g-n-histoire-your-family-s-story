import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker, useMap } from "react-leaflet";
import { Fragment, useEffect, useMemo } from "react";
import type { Person } from "@/lib/family-data";

type Props = {
  people: Person[];
  colorOf: (p: Person) => string;
  selectedId?: string | undefined;
  hoveredId?: string | undefined;
  onSelect: (id: string) => void;
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

/** Screen-space bearing (deg, 0 = up) between two geo points, mercator-corrected. */
function bearing(a: LatLng, b: LatLng) {
  const lat = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const dx = b[1] - a[1];
  const dy = -(b[0] - a[0]) / Math.max(Math.cos(lat), 0.2);
  return (Math.atan2(dx, -dy) * 180) / Math.PI;
}

function arrowIcon(color: string, angle: number, active: boolean) {
  const size = active ? 16 : 12;
  return L.divIcon({
    className: "gh-arrow",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<svg width="${size}" height="${size}" viewBox="0 0 12 12" style="transform:rotate(${angle}deg);opacity:${
      active ? 1 : 0.6
    }"><path d="M6 1 L10.5 10.5 L6 8 L1.5 10.5 Z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/></svg>`,
  });
}

function labelIcon(lines: { name: string; color: string; active: boolean }[]) {
  const html = lines
    .map(
      (l) =>
        `<span style="color:${l.color};font-weight:${l.active ? 700 : 500};opacity:${
          l.active ? 1 : 0.85
        }">${l.name}</span>`,
    )
    .join("<br/>");
  return L.divIcon({
    className: "gh-label",
    iconSize: [0, 0],
    iconAnchor: [-10, 8],
    html: `<div style="white-space:nowrap;font-size:11px;line-height:13px;text-shadow:0 0 3px #FDFBF7,0 0 3px #FDFBF7,0 0 5px #FDFBF7">${html}</div>`,
  });
}

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length) {
      map.fitBounds(points as [number, number][], {
        paddingTopLeft: [380, 60],
        paddingBottomRight: [80, 260],
        maxZoom: 7,
      });
    }
  }, [map, JSON.stringify(points)]);
  return null;
}

export default function FamilyMap({ people, colorOf, selectedId, hoveredId, onSelect }: Props) {
  const points = useMemo<LatLng[]>(
    () =>
      people.flatMap((p) =>
        [p.birth.place, p.union?.place, p.residence?.place, p.death?.place]
          .filter(Boolean)
          .map((pl) => [pl!.lat, pl!.lng] as LatLng),
      ),
    [people],
  );

  /** Names grouped by birth city so co-natives stack on separate lines. */
  const labels = useMemo(() => {
    const groups = new Map<string, { pos: LatLng; people: Person[] }>();
    for (const p of people) {
      const key = `${p.birth.place.lat.toFixed(3)},${p.birth.place.lng.toFixed(3)}`;
      const g = groups.get(key) ?? { pos: [p.birth.place.lat, p.birth.place.lng] as LatLng, people: [] };
      g.people.push(p);
      groups.set(key, g);
    }
    return [...groups.entries()];
  }, [people]);

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
        attribution="&copy; OpenStreetMap, &copy; CARTO"
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
            {legs.map((leg, i) => {
              const mid = leg[Math.floor(leg.length * 0.55)]!;
              const next = leg[Math.floor(leg.length * 0.55) + 1] ?? leg[leg.length - 1]!;
              return (
                <Fragment key={`${p.id}-leg-${i}`}>
                  <Polyline
                    positions={leg}
                    pathOptions={{
                      color,
                      weight: active ? 3.2 : 1.6,
                      opacity: active ? 0.95 : 0.42,
                      dashArray: i === legs.length - 1 && p.death ? "6 6" : undefined,
                    }}
                  />
                  <Marker
                    position={mid}
                    icon={arrowIcon(color, bearing(mid, next), active)}
                    interactive={false}
                    keyboard={false}
                  />
                </Fragment>
              );
            })}
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
                <div className="min-w-52 font-sans">
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

      {labels.map(([key, g]) => (
        <Marker
          key={`label-${key}`}
          position={g.pos}
          interactive={false}
          keyboard={false}
          icon={labelIcon(
            g.people.map((p) => ({
              name: p.name,
              color: colorOf(p),
              active: hoveredId === p.id || selectedId === p.id,
            })),
          )}
        />
      ))}
    </MapContainer>
  );
}
