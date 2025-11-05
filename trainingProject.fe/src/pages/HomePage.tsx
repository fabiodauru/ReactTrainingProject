import { useNavigate } from "react-router-dom";
import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";
import MapWidget from "../widgets/widgets/MapWidget";
import { useEffect, useState } from "react";
import SocialMediaWidget from "@/widgets/widgets/SocialMediaWidget";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import type { Trip, Restaurant } from "@/lib/type";

export default function HomePage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  const handleItemClick = (tripId: string | number) => {
    navigate(`/trips/${tripId}`);
  };

  const handleShowRestaurant = () => {
    navigate("/restaurant");
  };

  useEffect(() => {
    fetchTrips();
    fetchRestaurants();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get<{ items: Trip[] }>(ENDPOINTS.TRIP.ME);
      const items = Array.isArray(response?.items) ? response.items : [];
      setTrips(items);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get<{ items: Restaurant[] }>(
        ENDPOINTS.RESTAURANT.LIST
      );
      const items = Array.isArray(response?.items) ? response.items : [];
      setRestaurants(items);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    }
  };

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
        tripId: latestTrip.id,
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
          {loading ? (
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
              id: entry.id,
              content: `${entry.tripName ?? "Trip"} — ${
                entry.createdBy ?? "Unknown user"
              }`,
            }))}
            onItemClick={handleItemClick}
            amount={4}
            emptyMessage="You haven't created any trips yet"
            createPath="/createTrips"
            createLabel="Create your first trip"
          />
        </WidgetContainer>
        <WidgetContainer size="medium">
          <SocialMediaWidget trip={latestTrip} />
        </WidgetContainer>

        <WidgetContainer size="medium" onClick={handleShowRestaurant}>
          <ListWidget
            title="Restaurants"
            items={restaurants.map((restaurant) => ({
              id: restaurant.id,
              content: restaurant.restaurantName,
            }))}
            emptyMessage="No restaurants available"
          />
        </WidgetContainer>
      </WidgetLayout>
    </div>
  );
}
