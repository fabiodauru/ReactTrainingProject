import { useNavigate } from "react-router-dom";
import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";
import MapWidget from "../widgets/widgets/MapWidget";
import { useEffect, useState } from "react";

type TripDetails = {
  id: string | number;
  tripName?: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
};

type TripItem = {
  trip: TripDetails;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

export default function HomePage() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const handleListClick = () => {
    navigate("/trips");
  };

  useEffect(() => {
    fetch("http://localhost:5065/Trips/user", { credentials: "include" })
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

  const latestTrip = trips.at(-1)?.trip;

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
        tripId: latestTrip.id,
      }
    : undefined;

  return (
    <div className="p-6">
      <p className="mb-4 text-white/80">
        Welcome to our banger training project TravelBucket
      </p>
      <WidgetLayout>
        <WidgetContainer size="large">
          {!loaded ? (
            <div className="h-full w-full animate-pulse rounded-xl bg-white/5" />
          ) : trips.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-white/70">
              No trips to display.
            </div>
          ) : !mapProps ? (
            <div className="flex h-full w-full items-center justify-center text-white/70">
              This trip is missing valid coordinates.
            </div>
          ) : (
            <MapWidget {...mapProps} />
          )}
        </WidgetContainer>

        <WidgetContainer size="medium" onClick={handleListClick}>
          <ListWidget
            title="Your trips"
            content={[...trips].reverse().map((entry, index) => {
              const title =
                entry.trip.tripName ?? `Trip ${trips.length - index}`;
              const by = entry.createdByUsername ?? "Unknown user";
              return `${title} — ${by}`;
            })}
            amount={4}
          />
        </WidgetContainer>
      </WidgetLayout>
    </div>
  );
}
