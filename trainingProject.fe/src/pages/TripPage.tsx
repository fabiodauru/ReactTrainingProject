import { useEffect, useMemo, useState } from "react";
import MapWidget from "../widgets/widgets/MapWidget";
import WidgetContainer from "../widgets/WidgetContainer";
import ImageCarouselModal from "../components/ImageCarousel";
import { useNavigate } from "react-router-dom";

type TripDetails = {
  id: string | number;
  tripName?: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  distance?: number;
  duration?: string;
  description?: string;
};

type TripItem = {
  trip: TripDetails;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

type MapProps = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  tripId?: string | number;
};

export default function TripPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const navigate = useNavigate();
  const [mapProps, setMapProps] = useState<MapProps | undefined>(undefined);
  const [tripTitle, setTripTitle] = useState("Latest Trip");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5065/Trips/user", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items)
          ? (data.items as TripItem[])
          : [];
        setTrips(items);
      });
  }, []);
  
  const handleNewTrip = () => {
    navigate("/createTrips");
  }
  
  useEffect(() => {
    const latestTrip = trips.at(-1)?.trip;
    if (latestTrip) {
      setMapProps({
        start: {
          lat: Number(latestTrip.startCoordinates.latitude),
          lng: Number(latestTrip.startCoordinates.longitude),
        },
        end: {
          lat: Number(latestTrip.endCoordinates.latitude),
          lng: Number(latestTrip.endCoordinates.longitude),
        },
        tripId: latestTrip.id,
      });
    }
  }, [trips]);

  const orderedTrips = useMemo(
    () =>
      [...trips].reverse().map((entry, index) => ({
        ...entry,
        displayName: entry.trip.tripName ?? `Trip ${trips.length - index}`,
      })),
    [trips]
  );

  const handleTripClick = (trip: TripDetails) => {
    setMapProps({
      start: {
        lat: Number(trip.startCoordinates.latitude),
        lng: Number(trip.startCoordinates.longitude),
      },
      end: {
        lat: Number(trip.endCoordinates.latitude),
        lng: Number(trip.endCoordinates.longitude),
      },
      tripId: trip.id,
    });
    setTripTitle(trip.tripName ?? `Selected Trip`);
  };

  const handleViewImages = (tripId: string | number) => {
    if (!tripId) return;
    setIsLoadingImages(true);

    fetch(`http://localhost:5065/trips/images/${tripId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const urls = Array.isArray(data?.items)
          ? data.items.map((img: any) => img.url).filter(Boolean)
          : [];
        setImageUrls(urls);
        setIsCarouselOpen(true);
      })
      .catch(() => {
        setImageUrls([]);
        setIsCarouselOpen(true);
      })
      .finally(() => setIsLoadingImages(false));
  };

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">
      <header className="w-auto flex items-center justify-between">
        <div className="w-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-white/90">
            Trip Overview
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Explore your latest trip on the map and browse the full history.
          </p>
        </div>
        <div className="flex-shrink-0">
          <button onClick={handleNewTrip}>
            Create new Trip
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex flex-1 basis-full flex-col lg:basis-1/2">
          <WidgetContainer size="large">
            <div className="flex h-full flex-col">
              <header className="mb-4 border-b border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-white/85">
                  {tripTitle}
                </h2>
              </header>

              <div className="flex-1 overflow-hidden rounded-xl">
                {mapProps ? (
                  <MapWidget {...mapProps} />
                ) : trips.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-white/60">
                    No trip data available.
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-white/60">
                    Unable to render the selected trip.
                  </div>
                )}
              </div>
            </div>
          </WidgetContainer>
        </div>

        <div className="flex flex-1 flex-col lg:basis-1/2">
          <WidgetContainer size="large">
            <div className="flex h-full flex-col">
              <header className="mb-4 border-b border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-white/85">
                  Trip History
                </h2>
              </header>

              {orderedTrips.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl bg-white/5 text-white/60">
                  No trips recorded yet.
                </div>
              ) : (
                <ol className="flex-1 space-y-3 overflow-y-auto pr-2">
                  {orderedTrips.map((entry) => (
                    <li
                      key={entry.trip.id}
                      className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-sm transition hover:border-white/10 hover:bg-white/10"
                      onClick={() => handleTripClick(entry.trip)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white/90">
                            {entry.displayName}
                          </h3>
                          <p className="mt-1 text-xs text-white/55">
                            {entry.trip.description ??
                              "No description provided."}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/75">
                          by {entry.createdByUsername ?? "Unknown user"}
                        </span>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-white/65 sm:grid-cols-3">
                        <div>
                          <dt className="uppercase tracking-wide text-[0.65rem] text-white/45">
                            Distance
                          </dt>
                          <dd className="mt-1">
                            {entry.trip.distance
                              ? `${entry.trip.distance} km`
                              : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="uppercase tracking-wide text-[0.65rem] text-white/45">
                            Duration
                          </dt>
                          <dd className="mt-1">{entry.trip.duration ?? "—"}</dd>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <dd className="mt-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleViewImages(entry.trip.id);
                              }}
                              disabled={isLoadingImages}
                              className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isLoadingImages ? "Loading…" : "View images"}
                            </button>
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </WidgetContainer>
        </div>
      </div>

      <ImageCarouselModal
        imageUrls={imageUrls}
        isOpen={isCarouselOpen}
        onClose={() => setIsCarouselOpen(false)}
      />
    </div>
  );
}
