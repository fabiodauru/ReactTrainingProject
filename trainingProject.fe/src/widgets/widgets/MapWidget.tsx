import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import clsx from "clsx";

export default function MapWidget({
  start,
  end,
  interactive = true,
}: {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  interactive?: boolean;
  tripId?: string | number;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapElRef.current) return;

    let cancelled = false;

    (async () => {
      (window as any).L = L;
      await import("leaflet-routing-machine");
      if (cancelled || !mapElRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapElRef.current).setView([start.lat, start.lng], 5);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const control = (L as any).Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: false,
        draggableWaypoints: false,
        addWaypoints: false,
        show: false,
      }).addTo(map);

      control.on("routesfound", (e: any) => {
        const route = e?.routes?.[0];
        if (route?.bounds) {
          map.fitBounds(route.bounds.pad(0.1));
        }
      });

      const fallbackBounds = L.latLngBounds(
        [start.lat, start.lng],
        [end.lat, end.lng]
      ).pad(0.2);
      setTimeout(() => {
        if (!cancelled) {
          map.invalidateSize();
          if (map.getZoom() < 3 || !map.getBounds().contains(fallbackBounds)) {
            map.fitBounds(fallbackBounds);
          }
        }
      }, 0);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [start, end]);

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
