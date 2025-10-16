import { useState } from "react";
import clsx from "clsx";
import MapWidget from "../widgets/widgets/MapWidget";

export type LatLng = { lat: number; lng: number };
export default function CoordinatePicker({
  title,
  onRouteCalculated,
  onCoordinatesChange,
}: {
  title: string;
  onRouteCalculated: (distance: number, duration: number) => void;
  onCoordinatesChange?: (start: LatLng | null, end: LatLng | null) => void;
}) {
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);

  const handleMapClick = (coords: { lat: number; lng: number }) => {
    if (start && end) {
      setStart(coords);
      setEnd(null);
      onCoordinatesChange?.(coords, null);
      onRouteCalculated(0, 0);
      return;
    }

    if (!start) {
      setStart(coords);
    } else if (!end) {
      setEnd(coords);
      onCoordinatesChange?.(start, coords);
    }
  };

  const resetDisabled = !start && !end;

  return (
    <section className="mt-6">
      <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-slate-800/60 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-semibold text-white/90">{title}</h3>
            <p className="text-xs text-white/55">
              Click the map to set a start point, then an end point to preview
              the route.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStart(null);
              setEnd(null);
              onRouteCalculated(0, 0);
            }}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full onRouteCalculated px-4 py-1.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
              resetDisabled && "invisible opacity-0 pointer-events-none"
            )}
          >
            Reset
          </button>
        </div>

        <div className="relative h-[32rem] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
          <MapWidget
            start={start}
            end={end}
            interactive
            onCoordinateSelect={handleMapClick}
            onRouteCalculated={onRouteCalculated}
          />
        </div>
      </div>
    </section>
  );
}
