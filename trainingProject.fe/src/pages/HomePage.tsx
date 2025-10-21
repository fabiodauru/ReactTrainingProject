import { useNavigate } from "react-router-dom";
import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";
import MapWidget from "../widgets/widgets/MapWidget";
import { useEffect, useState } from "react";
import SocialMediaWidget from "@/widgets/widgets/SocialMediaWidget";

type TripItem = {
  tripId: string;
  tripName: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  description: string;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const handleItemClick = (tripId: string | number) => {
    navigate(`/trips/${tripId}`);
  };

  useEffect(() => {
    fetch("http://localhost:5065/api/Trips/user", { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        const items = Array.isArray(json?.items)
          ? (json.items as TripItem[])
          : [];
        setTrips(items);
      })
      .catch(() => setTrips([]))
      .finally(() => setLoaded(true));
  }, []);

  const latestTrip = trips.at(-1);
  const mapProps = latestTrip
    ? {
        start: {
          lat: Number(latestTrip.startCoordinates.latitude),
          lng: Number(latestTrip.startCoordinates.longitude),
        },
        end: {
          lat: Number(latestTrip.endCoordinates.latitude),
          lng: Number(latestTrip.endCoordinates.longitude),
        },
        tripId: latestTrip.tripId,
      }
    : undefined;

  const reversedTrips = [...trips].reverse();

  return (
    <div className="pt-8 h-full bg-[color:var(--color-background)]">
      <p className="mb-4 text-[color:var(--color-muted-foreground)] text-center">
        Welcome to our banger training project TravelBucket
      </p>
      <WidgetLayout>
        <WidgetContainer size="large">
          {!loaded ? (
            <div className="h-full w-full animate-pulse rounded-xl bg-[color:color-mix(in srgb,var(--color-foreground) 5%,transparent)]" />
          ) : trips.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-[color:var(--color-muted-foreground)]">
              No trips to display.
            </div>
          ) : !mapProps ? (
            <div className="flex h-full w-full items-center justify-center text-[color:var(--color-muted-foreground)]">
              This trip is missing valid coordinates.
            </div>
          ) : (
            <MapWidget {...mapProps} />
          )}
        </WidgetContainer>

        <WidgetContainer size="medium">
          <ListWidget
            title="Your latest trips"
            items={reversedTrips.map((entry) => ({
              id: entry.tripId,
              content: `${entry.tripName ?? "Trip"} — ${
                entry.createdByUsername ?? "Unknown user"
              }`,
            }))}
            onItemClick={handleItemClick}
            amount={4}
          />
        </WidgetContainer>
        <WidgetContainer size="medium">
          <SocialMediaWidget trip={latestTrip} />
        </WidgetContainer>
      </WidgetLayout>
    </div>
  );
}
