import { useEffect, useMemo, useState } from "react";
import MapWidget from "../widgets/widgets/MapWidget";
import WidgetContainer from "../widgets/WidgetContainer";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

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
  difficulty?: number;
  elevation?: number;
};

type TripImage = {
  ImageFile: string;
  Description: string;
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
  const [imageCache, setImageCache] = useState<Record<string, TripImage[]>>({});
  const [, setLoadingImagesFor] = useState<string | number | null>(null);
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
    fetch("http://localhost:5065/api/Trips/user", { credentials: "include" })
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

  useEffect(() => {
    if (!selectedTripId) return;
    const cacheKey = String(selectedTripId);
    if (imageCache[cacheKey]) return;
    fetch(`http://localhost:5065/api/trips/images/${selectedTripId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        const images: TripImage[] = Array.isArray(data?.items)
          ? data.items.map((img: any) => ({
              ImageFile: img.imageFile,
              Description: img.description || "No description",
            }))
          : [];
        setImageCache((prev) => ({ ...prev, [cacheKey]: images }));
      })
      .catch(() => {
        setImageCache((prev) => ({ ...prev, [cacheKey]: [] }));
      })
      .finally(() => setLoadingImagesFor(null));
  }, [selectedTripId, imageCache]);

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

  function formatDuration(duration?: string): string {
    if (!duration) return "";
    let days = 0,
      hours = 0,
      minutes = 0;
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
      }
    }
    const parts: string[] = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    return parts.length ? parts.join(" ") : "0m";
  }

  function formatDistance(distance?: number): string {
    if (distance == null) return "—";
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance.toFixed(0)} m`;
  }

  const handleDeleteTrip = (tripId: string | number) => {
    if (!tripId) return;

    fetch(`http://localhost:5065/api/Trips/images/${String(tripId)}`, {
      method: "DELETE",
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        if (selectedTripId === tripId) {
          setMapProps(undefined);
          setTripTitle("Latest Trip");
          setSelectedTripId(undefined);
        }
        setMenuOpenId(null);
        fetchTrips();
      }
    });
  };

  const renderImages = (tripId: string | number) => {
    const cacheKey = String(tripId);
    const images: TripImage[] = imageCache[cacheKey] ?? [];
    const isOpen = selectedTripId === tripId;

    return (
      <div
        className={`flex flex-col gap-3 overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[420px] opacity-100 pt-4" : "max-h-0 opacity-0"
        }`}
      >
        {isOpen && (
          <>
            {images.length > 0 ? (
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-3">
                  {images.map((image, idx) => (
                    <CarouselItem
                      key={idx}
                      className="pl-3 basis-1/2 md:basis-1/3"
                    >
                      <figure className="flex w-full h-full shrink-0 flex-col gap-2 rounded-xl bg-[color:color-mix(in srgb,var(--color-muted) 50%,transparent)] p-3">
                        <img
                          src={`data:image/jpeg;base64,${image.ImageFile}`}
                          alt={`Trip ${tripId} image ${idx + 1}`}
                          className="h-32 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                        <figcaption className="truncate text-xs text-[color:var(--color-muted-foreground)]">
                          {image.Description}
                        </figcaption>
                      </figure>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            ) : (
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[color:var(--color-muted)] text-sm text-[color:var(--color-muted-foreground)]">
                No images found for this trip.
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[color:var(--color-background)] p-6 text-[color:var(--color-foreground)]">
      <header className="flex w-full items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="truncate text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Trip Overview
          </h2>
          <p className="truncate text-sm text-[color:var(--color-muted-foreground)]">
            Explore your latest trip and browse your full history.
          </p>
        </div>
        <Button onClick={handleNewTrip} variant="secondary">
          Create new Trip
        </Button>
      </header>

      <div className="mx-auto max-w-screen-2xl">
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
          <div className="flex flex-1 basis-full flex-col lg:basis-1/2 lg:w-1/2">
            <WidgetContainer size="large">
              <div className="flex h-full flex-col">
                <header className="mb-4 border-b border-[color:var(--color-muted)] pb-2">
                                    <h2 className="text-lg font-semibold text-[color:var(--color-foreground)]">
                    {tripTitle}
                  </h2>
                </header>
                <div className="flex-1 overflow-hidden rounded-xl">
                  {mapProps ? (
                    <MapWidget {...mapProps} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[color:var(--color-muted-foreground)]">
                      {trips.length === 0
                        ? "No trip data available."
                        : "Select a trip to see it on the map."}
                    </div>
                  )}
                </div>
              </div>
            </WidgetContainer>
          </div>

          <div className="flex flex-1 flex-col lg:basis-1/2 lg:w-1/2">
            <WidgetContainer size="large">
              <div className="flex h-full flex-col">
                <header className="mb-5 flex flex-col gap-2 border-b border-[color:var(--color-muted)] pb-3">
                  <h2 className="text-xl font-semibold text-[color:var(--color-foreground)]">
                    Trip History
                  </h2>
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    Review past journeys and manage details.
                  </p>
                </header>

                {orderedTrips.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[color:var(--color-muted)] bg-[color:color-mix(in srgb,var(--color-primary) 50%,transparent)] text-[color:var(--color-muted-foreground)]">
                    No trips recorded yet.
                  </div>
                ) : (
                  <ol className="flex flex-1 flex-col gap-4 overflow-y-auto pr-1 no-scrollbar">
                    {orderedTrips.map((entry) => {
                      const isSelected = entry.tripId === selectedTripId;
                      const isMenuOpen = menuOpenId === entry.tripId;

                      const stats = [
                        entry.distance !== undefined && {
                          label: "Distance",
                          value: formatDistance(entry.distance),
                        },
                        entry.duration && {
                          label: "Duration",
                          value: formatDuration(entry.duration),
                        },
                        entry.elevation !== undefined && {
                          label: "Elevation",
                          value: `${entry.elevation} m`,
                        },
                        entry.difficulty && {
                          label: "Difficulty",
                          value: entry.difficulty.toString(),
                        },
                      ].filter(Boolean) as { label: string; value: string }[];

                      return (
                        <li
                          key={entry.tripId}
                          className={`min-w-0 flex flex-col rounded-xl border bg-[color:color-mix(in srgb,var(--color-primary) 70%,transparent)] p-5 shadow-md transition-all duration-200 hover:bg-[color:color-mix(in srgb,var(--color-muted) 50%,transparent)] ${
                            isSelected
                              ? "border-[color:var(--color-accent)] hover:border-[color:var(--color-accent)]"
                              : "border-[color:var(--color-muted)] hover:border-[color:var(--color-muted)]"
                          }`}
                          onClick={() => handleTripClick(entry)}
                        >
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-shrink-0 flex items-center">
                                <span className="rounded-lg bg-[color:color-mix(in srgb,var(--color-accent) 10%,transparent)] px-2 py-0.5 text-xs font-medium text-[color:var(--color-accent-secondary)]">
                                  {entry.createdByUsername ?? "Unknown"}
                                </span>
                              </div>

                              <div className="min-w-0 flex-1 flex flex-col items-center text-center gap-1">
                                <h3 className="truncate text-lg font-semibold text-[color:var(--color-foreground)]">
                                  {entry.displayName}
                                </h3>
                                <p className="truncate text-sm text-[color:var(--color-muted-foreground)] max-w-full">
                                  {entry.description ||
                                    "No description provided."}
                                </p>
                              </div>

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setMenuOpenId((prev) =>
                                      prev === entry.tripId
                                        ? null
                                        : entry.tripId
                                    );
                                  }}
                                  className="z-10 rounded-xl p-2 text-xl leading-none text-[color:var(--color-muted-foreground)] transition hover:bg-[color:var(--color-muted)]"
                                >
                                  ⋯
                                </button>

                                {isMenuOpen && (
                                  <div
                                    className="absolute right-0 top-full z-20 mt-2 flex w-32 flex-col overflow-hidden rounded-md border border-[color:var(--color-muted)] bg-[color:var(--color-primary)] shadow-xl"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="flex items-center gap-3 px-4 py-2 text-sm text-[color:var(--color-foreground)] transition hover:bg-[color:var(--color-muted)]"
                                    >
                                      ✏️
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteTrip(entry.tripId)
                                      }
                                      className="flex items-center gap-3 px-4 py-2 text-sm text-[color:var(--color-error)] transition hover:bg-[color:color-mix(in srgb,var(--color-error) 15%,transparent)]"
                                    >
                                      🗑️
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {stats.length > 0 && (
                              <div className="flex items-center justify-center gap-3 border-t border-[color:var(--color-muted)] pt-4">
                                <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[color:var(--color-foreground)]">
                                  {stats.map((stat) => (
                                    <div
                                      key={stat.label}
                                      className="flex min-w-0 flex-col items-center gap-1"
                                    >
                                      <span className="text-xs uppercase tracking-wide text-[color:var(--color-muted-foreground)]">
                                        {stat.label}
                                      </span>
                                      <span className="text-sm font-medium text-[color:var(--color-foreground)]">
                                        {stat.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
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
    </div>
  );
}
