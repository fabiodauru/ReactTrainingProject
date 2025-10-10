import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import clsx from "clsx";

export default function MapWidget({
  start,
  end,
  interactive = true,
  tripId,
}: {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  interactive?: boolean;
  tripId?: string | number;
}) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();

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

  const openTrip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent WidgetContainer onClickCapture
    if (tripId != null) navigate(`/trip/${tripId}`);
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={mapElRef}
        className={clsx(
          "h-full w-full rounded-xl",
          !interactive && "pointer-events-none"
        )}
      />
      {tripId != null && (
        <button
          onClickCapture={openTrip}
          className="absolute top-3 right-3 z-[3] rounded-full border border-white/10 bg-gray-800/90 text-white px-3 py-1.5 text-sm shadow hover:bg-gray-700/90 active:scale-95 transition"
          title="Open trip"
        >
          Open trip
        </button>
      )}
    </div>
  );
}
