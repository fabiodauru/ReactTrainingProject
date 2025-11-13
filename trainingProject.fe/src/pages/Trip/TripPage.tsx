import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MapWidget from "../../components/commons/MapWidget";
import WidgetContainer from "../../components/layout/WidgetContainer";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/api";
import type { Trip, Image, MapProps, User } from "@/lib/type";

type TripWithUser = Trip & {
  displayName?: string;
  createdByUsername?: string;
};

export default function TripPage() {
  const { tripId } = useParams();
  const [trips, setTrips] = useState<TripWithUser[]>([]);
  const [mapProps, setMapProps] = useState<MapProps | undefined>(undefined);
  const [tripTitle, setTripTitle] = useState("Latest Trip");
  const [selectedTripId, setSelectedTripId] = useState<string | number>();
  const [menuOpenId, setMenuOpenId] = useState<string | number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleWindowClick = () => setMenuOpenId(null);
    window.addEventListener("click", handleWindowClick);
    return () => window.removeEventListener("click", handleWindowClick);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get<Trip[]>(ENDPOINTS.TRIP.ME, {
        credentials: "include",
      });

      const tripItems = Array.isArray(response) ? response : [];

      const tripsWithUsers = await Promise.all(
        tripItems.map(async (trip) => {
          try {
            const user = await api.get<User>(
              ENDPOINTS.USER.BY_ID(trip.createdBy)
            );
            return {
              ...trip,
              createdByUsername: user.username,
            };
          } catch (error) {
            console.error(`Error fetching user for trip ${trip.id}:`, error);
            return {
              ...trip,
              createdByUsername: "Unknown",
            };
          }
        })
      );
      setTrips(tripsWithUsers);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    }
  };

  const handleNewTrip = () => {
    navigate("/createTrips");
  };

  useEffect(() => {
    if (tripId) {
      const selectedTrip = trips.find((trip) => trip.id === tripId);
      if (selectedTrip) {
        setMapProps({
          start: {
            lat: Number(selectedTrip.startCoordinates.latitude),
            lng: Number(selectedTrip.startCoordinates.longitude),
          },
          end: {
            lat: Number(selectedTrip.endCoordinates.latitude),
            lng: Number(selectedTrip.endCoordinates.longitude),
          },
          tripId: selectedTrip.id,
        });
        setTripTitle(selectedTrip.tripName ?? "Selected Trip");
        setSelectedTripId(selectedTrip.id);
      }
    } else {
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
          tripId: latestTrip.id,
        });
        setTripTitle(latestTrip.tripName ?? "Latest Trip");
        setSelectedTripId(latestTrip.id);
      }
    }
  }, [trips, tripId]);

  const orderedTrips = useMemo(
    () =>
      [...trips].reverse().map((entry, index) => ({
        ...entry,
        displayName: entry.tripName ?? `Trip ${trips.length - index}`,
      })),
    [trips]
  );

  const handleTripClick = (trip: TripWithUser) => {
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
    setTripTitle(trip.tripName ?? trip.displayName ?? "Selected Trip");
    setSelectedTripId(trip.id);
  };

  function formatDuration(duration?: string | number): string {
    if (!duration) return "";

    const durationStr = String(duration);
    let days = 0,
      hours = 0,
      minutes = 0;

    let match = durationStr.match(/^(\d+)\.(\d{1,2}):(\d{2}):/);
    if (match) {
      days = Number(match[1]);
      hours = Number(match[2]);
      minutes = Number(match[3]);
    } else {
      match = durationStr.match(/^(\d{1,2}):(\d{2}):/);
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

  const handleDeleteTrip = async (tripId: string | number) => {
    if (!tripId) return;

    try {
      await api.delete(ENDPOINTS.TRIP.BY_ID(String(tripId)));
      if (selectedTripId === tripId) {
        setMapProps(undefined);
        setTripTitle("Latest Trip");
        setSelectedTripId(undefined);
      }
      setMenuOpenId(null);
      fetchTrips();
    } catch (error) {
      console.error("Error deleting trip:", error);
    }
  };

  const renderImages = (trip: Trip) => {
    const images: Image[] = Array.isArray(trip.images) ? trip.images : [];
    const isOpen = selectedTripId === trip.id;

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
                          src={`data:image/jpeg;base64,${image.imageFile}`}
                          alt={`Trip ${trip.id} image ${idx + 1}`}
                          className="h-32 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                        <figcaption className="truncate text-xs text-[color:var(--color-muted-foreground)]">
                          {image.description || "No description"}
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
                  <h2 className="text-lg font-semibold text-[color:var(--color-foreground]">
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
                      const isSelected = entry.id === selectedTripId;
                      const isMenuOpen = menuOpenId === entry.id;

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
                          key={entry.id}
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
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setMenuOpenId((prev) =>
                                      prev === entry.id ? null : entry.id
                                    );
                                  }}
                                  className="z-10 text-xl leading-none text-[color:var(--color-muted-foreground)]"
                                >
                                  ⋯
                                </Button>

                                {isMenuOpen && (
                                  <div
                                    className="absolute right-0 top-full z-20 mt-2 flex w-32 flex-col overflow-hidden rounded-md border border-[color:var(--color-muted)] bg-[color:var(--color-primary)] shadow-xl"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <Button
                                      variant="ghost"
                                      className="justify-start gap-3 rounded-none h-auto py-2 shadow-none hover:shadow-none"
                                    >
                                      ✏️
                                      <span>Edit</span>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      onClick={() => handleDeleteTrip(entry.id)}
                                      className="justify-start gap-3 rounded-none h-auto py-2 text-[color:var(--color-error)] hover:bg-[color:color-mix(in srgb,var(--color-error) 15%,transparent)] hover:text-[color:var(--color-error)] shadow-none hover:shadow-none"
                                    >
                                      🗑️
                                      <span>Delete</span>
                                    </Button>
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

                          {renderImages(entry)}
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
