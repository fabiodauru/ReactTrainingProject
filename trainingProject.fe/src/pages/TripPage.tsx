import { useEffect, useMemo, useState } from "react";
import MapWidget from "../widgets/widgets/MapWidget";
import WidgetContainer from "../widgets/WidgetContainer";
import { useNavigate } from "react-router-dom";

type TripItem = {
  tripId: string | number;
  tripName?: string | null;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  description?: string | null;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
  distance?: number;
  duration?: string;
  difficulty? : number;
  elevation? : number;
};

type MapProps = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  tripId?: string | number;
};

export default function TripPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [mapProps, setMapProps] = useState<MapProps | undefined>(undefined);
  const [tripTitle, setTripTitle] = useState("Latest Trip");
  const [selectedTripId, setSelectedTripId] = useState<string | number>();
  const [menuOpenId, setMenuOpenId] = useState<string | number | null>(null);
  const [openGalleryId, setOpenGalleryId] = useState<string | number | null>(
    null
  );
  const [imageCache, setImageCache] = useState<Record<string, string[]>>({});
  const [loadingImagesFor, setLoadingImagesFor] = useState<
    string | number | null
  >(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleWindowClick = () => setMenuOpenId(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = () => {
    fetch("http://localhost:5065/Trips/user", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items)
          ? (data.items as TripItem[])
          : [];
        setTrips(items);
      });
  };

  const handleNewTrip = () => {
    navigate("/createTrips");
  };

  useEffect(() => {
    const latestTrip = trips.at(-1);
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
        tripId: latestTrip.tripId,
      });
      setTripTitle(latestTrip.tripName ?? "Latest Trip");
      setSelectedTripId(latestTrip.tripId);
    } else {
      setMapProps(undefined);
      setTripTitle("Latest Trip");
      setSelectedTripId(undefined);
    }
  }, [trips]);

  const orderedTrips = useMemo(
    () =>
      [...trips].reverse().map((entry, index) => ({
        ...entry,
        displayName: entry.tripName ?? `Trip ${trips.length - index}`,
      })),
    [trips]
  );

  const handleTripClick = (trip: TripItem & { displayName?: string }) => {
    setMapProps({
      start: {
        lat: Number(trip.startCoordinates.latitude),
        lng: Number(trip.startCoordinates.longitude),
      },
      end: {
        lat: Number(trip.endCoordinates.latitude),
        lng: Number(trip.endCoordinates.longitude),
      },
      tripId: trip.tripId,
    });
    setTripTitle(trip.tripName ?? trip.displayName ?? "Selected Trip");
    setSelectedTripId(trip.tripId);
  };

  const handleToggleImages = (
    event: React.MouseEvent,
    tripId: string | number
  ) => {
    event.stopPropagation();
    if (openGalleryId === tripId) {
      setOpenGalleryId(null);
      return;
    }

    const cacheKey = String(tripId);
    if (imageCache[cacheKey]) {
      setOpenGalleryId(tripId);
      return;
    }

    setLoadingImagesFor(tripId);

    fetch(`http://localhost:5065/trips/images/${tripId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const urls = Array.isArray(data?.items)
          ? data.items.map((img: any) => img.url).filter(Boolean)
          : [];
        setImageCache((prev) => ({ ...prev, [cacheKey]: urls }));
        setOpenGalleryId(tripId);
      })
      .catch(() => {
        setImageCache((prev) => ({ ...prev, [cacheKey]: [] }));
        setOpenGalleryId(tripId);
      })
      .finally(() => setLoadingImagesFor(null));
  };

  function formatDuration(duration?: string): string {
    if (!duration) return "";

    let days = 0, hours = 0, minutes = 0;

    let match = duration.match(/^(\d+)\.(\d{1,2}):(\d{2}):/);
    if (match) {
      days = Number(match[1]);
      hours = Number(match[2]);
      minutes = Number(match[3]);
    } else {
      match = duration.match(/^(\d{1,2}):(\d{2}):/);
      if (match) {
        hours = Number(match[1]);
        minutes = Number(match[2]);
      } else {
        match = duration.match(/^(\d{1,2}):?(\d{2})?$/);
        if (match) {
          if (match[2]) {
            hours = Number(match[1]);
            minutes = Number(match[2]);
          } else {
            minutes = Number(match[1]);
          }
        }
      }
    }

    const parts: string[] = [];
    if (days) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    if (hours) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);

    return parts.length ? parts.join(", ") : "0 minutes";
  }

  function formatDistance(distance?: number): string {
    if (distance == null) return "—";

    if (distance >= 1000) {
      const km = (distance / 1000).toFixed(1);
      return `${km} km`;
    } else {
      return `${distance.toFixed(0)} meter${distance === 1 ? "" : "s"}`;
    }
  }


  const handleDeleteTrip = (tripId: string | number) => {
    if (!tripId) return;
    const idToDelete = String(tripId);

    fetch(`http://localhost:5065/trips/${idToDelete}`, {
      method: "DELETE",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        if (selectedTripId === tripId) {
          setMapProps(undefined);
          setTripTitle("Latest Trip");
          setSelectedTripId(undefined);
        }
        if (openGalleryId === tripId) {
          setOpenGalleryId(null);
        }
        setMenuOpenId(null);
        fetchTrips();
      }
    });
  };

  const renderImages = (tripId: string | number) => {
    const cacheKey = String(tripId);
    const images = imageCache[cacheKey] ?? [];
    const isOpen = openGalleryId === tripId;

    return (
      <div
        className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[420px] opacity-100 pt-4" : "max-h-0 opacity-0"
        }`}
      >
        {isOpen && (
          <>
            {images.length > 0 ? (
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-2">
                {images.map((url, idx) => (
                  <figure
                    key={url ?? idx}
                    className="flex w-40 shrink-0 flex-col gap-2 rounded-xl bg-white/6 p-3 shadow-inner shadow-black/40"
                  >
                    <img
                      src={url}
                      alt={`Trip ${tripId} image ${idx + 1}`}
                      className="h-32 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                    <figcaption className="truncate text-xs text-white/55">
                      Photo {idx + 1}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-xl border border-white/10 text-sm text-white/55">
                No images found for this trip.
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-slate-950 p-6 text-white">
      <header className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-2xl font-semibold tracking-tight text-white">
            Trip Overview
          </h2>
          <p className="truncate text-sm text-white/60">
            Explore your latest trip on the map and browse the full history.
          </p>
        </div>
        <button
          onClick={handleNewTrip}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:-translate-y-[1px] hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          Create new Trip
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="flex flex-1 basis-full flex-col lg:basis-1/2">
          <WidgetContainer size="large">
            <div className="flex h-full flex-col">
              <header className="mb-4 border-b border-white/10 pb-2">
                <h2 className="text-lg font-semibold text-white">
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
              <header className="mb-5 flex flex-col gap-2 border-b border-emerald-500/40 pb-3">
                <h2 className="text-xl font-semibold text-emerald-300">
                  Trip History
                </h2>
                <p className="text-sm text-white/55">
                  Review past journeys and manage details in one place.
                </p>
              </header>

              {orderedTrips.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/5 text-white/60">
                  No trips recorded yet.
                </div>
              ) : (
                <ol className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                  {orderedTrips.map((entry) => {
                    const isSelected = entry.tripId === selectedTripId;
                    const isMenuOpen = menuOpenId === entry.tripId;
                    const isGalleryOpen = openGalleryId === entry.tripId;
                    const isLoading = loadingImagesFor === entry.tripId;

                    const stats: Array<{ label: string; value: string }> = [];
                    if (entry.distance !== undefined) {
                      stats.push({
                        label: "Distance",
                        value: `${entry.distance} km`,
                      });
                    }
                    if (entry.duration) {
                      stats.push({ label: "Duration", value: entry.duration });
                    }
                    if (entry.elevation !== undefined) {
                      stats.push({
                        label: "Elevation",
                        value: `${entry.elevation} m`,
                      });
                    }
                    if (entry.difficulty) {
                      stats.push({
                        label: "Difficulty",
                        value: entry.difficulty,
                      });
                    }

                    return (
                      <li
                        key={entry.tripId}
                        className={`flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_45px_-20px_rgba(0,0,0,0.7)] transition hover:-translate-y-[1px] hover:border-emerald-400/30 hover:bg-white/[0.06] ${
                          isSelected ? "border-emerald-400/40" : ""
                        }`}
                        onClick={() => handleTripClick(entry)}
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                  {entry.createdByUsername ?? "Unknown user"}
                                </span>
                                {isSelected && (
                                  <span className="text-xs uppercase tracking-wide text-emerald-300">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <h3 className="truncate text-lg font-semibold text-white">
                                {entry.displayName}
                              </h3>
                              <p className="truncate text-sm text-white/60">
                                {entry.description ??
                                  "No description provided."}
                              </p>
                            </div>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setMenuOpenId((prev) =>
                                    prev === entry.tripId ? null : entry.tripId
                                  );
                                }}
                                className="rounded-full bg-white/8 px-2 py-1 text-base text-white/60 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                              >
                                ⋯
                              </button>

                              {isMenuOpen && (
                                <div
                                  className="absolute right-0 mt-2 flex w-20 flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900/95 shadow-[0_16px_35px_rgba(0,0,0,0.55)]"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    className="flex items-center justify-center px-3 py-2 text-lg text-white/80 transition hover:bg-white/10"
                                    title="Edit Trip"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      handleDeleteTrip(entry.tripId);
                                    }}
                                    className="flex items-center justify-center px-3 py-2 text-lg text-red-400 transition hover:bg-red-500/15"
                                    title="Delete Trip"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {stats.length > 0 && (
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 flex-nowrap items-center gap-5 text-white/75">
                                {stats.map((stat) => (
                                  <div
                                    key={stat.label}
                                    className="flex min-w-0 items-center gap-2"
                                  >
                                    <span className="text-[0.7rem] uppercase tracking-wide text-white/40">
                                      {stat.label}
                                    </span>
                                    <span className="truncate text-sm text-white/85">
                                      {stat.value}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={(event) =>
                                  handleToggleImages(event, entry.tripId)
                                }
                                className={`flex items-center gap-1 rounded-full bg-white/8 px-2 py-1 text-xs font-medium text-white/70 transition hover:bg-white/15 hover:text-white ${
                                  isLoading ? "cursor-wait opacity-60" : ""
                                }`}
                              >
                                <span>{isLoading ? "…" : "Photos"}</span>
                                <span
                                  className={`transition-transform ${
                                    isGalleryOpen ? "rotate-180" : ""
                                  }`}
                                >
                                  ▾
                                </span>
                              </button>
                            </div>
                          )}
                        </div>

                        {renderImages(entry.tripId)}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </WidgetContainer>
        </div>
      </div>
    </div>
  );
}
