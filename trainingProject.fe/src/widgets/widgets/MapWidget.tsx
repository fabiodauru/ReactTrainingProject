import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import clsx from "clsx";

type LatLng = { lat: number; lng: number };

type Props = {
  start?: LatLng | null;
  end?: LatLng | null;
  interactive?: boolean;
  onCoordinateSelect?: (coords: LatLng) => void;
};

export default function MapWidget({
  start,
  end,
  interactive = true,
  onCoordinateSelect,
}: Props) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeControlRef = useRef<any>(null);

  useEffect(() => {
    if (!mapElRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapElRef.current, {
        zoomControl: true,
        dragging: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive,
      }).setView([20, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      if (interactive && onCoordinateSelect) {
        map.on("click", (event: L.LeafletMouseEvent) =>
          onCoordinateSelect({ lat: event.latlng.lat, lng: event.latlng.lng })
        );
      }

      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!map) return;

    if (routeControlRef.current) {
      map.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }

    if (!start || !end) return;

    let cancelled = false;

    (async () => {
      (window as any).L = L;
      await import("leaflet-routing-machine");
      if (cancelled) return;

      const control = (L as any).Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
      }).addTo(map);

      routeControlRef.current = control;

      control.on("routesfound", (e: any) => {
        const bounds = e?.routes?.[0]?.bounds;
        if (bounds) map.fitBounds(bounds.pad(0.1));
      });

      const fallbackBounds = L.latLngBounds(
        [start.lat, start.lng],
        [end.lat, end.lng]
      ).pad(0.2);

      requestAnimationFrame(() => {
        map.invalidateSize();
        if (map.getZoom() < 3 || !map.getBounds().contains(fallbackBounds)) {
          map.fitBounds(fallbackBounds);
        }
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [start, end, interactive, onCoordinateSelect]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapElRef}
        className={clsx(
          "h-full w-full rounded-xl",
          !interactive && "pointer-events-none"
        )}
      />
    </div>
  );
}
