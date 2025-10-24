import {useEffect, useState} from "react";
import clsx from "clsx";
import MapWidget from "../widgets/widgets/MapWidget";

export type LatLng = { lat: number; lng: number };
export default function CoordinatePicker({
  title, 
                                           mode = "route",
                                           value,
  onRouteCalculated,
  onCoordinatesChange,
                                           allowReset = true,
}: {
  title: string;
  mode?: "route" | "point";
  onRouteCalculated?: (distance: number, duration: number) => void;
  value?: LatLng | { start?: LatLng | null; end?: LatLng | null } | null;
  onCoordinatesChange?: (start: LatLng | null, end: LatLng | null) => void;
  allowReset?: boolean;
}) {
  const isPointMode = mode === "point";
  
  const [start, setStart] = useState<{ lat: number; lng: number } | null>(null);
  const [end, setEnd] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (value == null) {
      setStart(null);
      setEnd(null);
      return;
    }
    
    if ((value as LatLng).lat !== undefined && (value as LatLng).lng !== undefined) {
      const v = value as LatLng;
      setStart(v);
      setEnd(null);
      return;
    }
    
    const v = value as { start?: LatLng | null; end?: LatLng | null };
    setStart(v.start ?? null);
    setEnd(isPointMode ? null : v.end ?? null);
  }, [value, isPointMode]);

  const handleMapClick = (coords: LatLng) => {
    if (isPointMode) {
      setStart(coords);
      setEnd(null);
      onCoordinatesChange?.(coords, null);
      onRouteCalculated?.(0, 0);
      return;
    }

    
    if (start && end) {
      setStart(coords);
      setEnd(null);
      onCoordinatesChange?.(coords, null);
      onRouteCalculated?.(0, 0);
      return;
    }


    if (!start) {
      setStart(coords);
      onCoordinatesChange?.(coords, null);
    } else if (!end) {
      setEnd(coords);
      onCoordinatesChange?.(start, coords);
    }
  };


  const resetDisabled = !start && !end;

  return (
      <section className="mt-6">
        <div className="rounded-2xl border border-[color:color-mix(in srgb,var(--color-foreground) 12%,transparent)] bg-gradient-to-br from-[color:color-mix(in srgb,var(--color-primary) 70%,transparent)] via-[color:color-mix(in srgb,var(--color-primary) 50%,transparent)] to-[color:color-mix(in srgb,var(--color-primary) 40%,transparent)] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 border-b border-[color:color-mix(in srgb,var(--color-foreground) 10%,transparent)] pb-3">
            <div className={"flex-col"}>
              <h3 className="text-lg font-semibold text-[color:color-mix(in srgb,var(--color-foreground) 90%,transparent)]">{title}</h3>
              <p className="text-xs text-[color:color-mix(in srgb,var(--color-foreground) 55%,transparent)]">
                {isPointMode
                    ? "Click the map to place your Pin."
                    : "Click the map to set a start point, then an end point to preview the route."}
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                  setStart(null);
                  setEnd(null);
                  onCoordinatesChange?.(null, null);
                  onRouteCalculated?.(0, 0);
                }}
                className={clsx(
                    "inline-flex items-center gap-2 rounded-md bg-[color:var(--color-muted)] px-4 py-1.5 text-sm font-semibold text-[color:var(--color-foreground)] shadow-md transition-all duration-200 hover:bg-[color:var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:color-mix(in srgb,var(--color-accent) 70%,transparent)]",
                    (resetDisabled || !allowReset) && "invisible opacity-0 pointer-events-none"
                )}
            >
              Reset
            </button>
          </div>


          <div className="relative h-[32rem] overflow-hidden rounded-2xl border border-[color:color-mix(in srgb,var(--color-foreground) 10%,transparent)] bg-[color:color-mix(in srgb,var(--color-background) 80%,transparent)]">
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
