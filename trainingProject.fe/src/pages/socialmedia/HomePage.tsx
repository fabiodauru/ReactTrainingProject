import SearchUserComponent from "@/components/SearchUserComponent";
import SocialMediaCard from "../../components/SocialMediaCard";
import { useUser } from "../../context/UserContext";
import { useEffect, useState } from "react";

type Trip = {
  id: string | number;
  tripName?: string;
  createdBy: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  distance?: number;
  duration?: string;
  description?: string;
};

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { username } = useUser() || {};

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("http://localhost:5065/api/Trips", {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const items = Array.isArray(data.result.trips)
          ? (data.result.trips as Trip[])
          : [];

        setTrips(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            Loading trips...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-[1fr_15fr_1fr] grid-rows-[4rem_1fr] gap-4">
      <div className="row-start-1 col-start-2 justify-items-center">
        <SearchUserComponent />
      </div>
      <a
        href="../"
        className="flex flex-col justify-start row-start-1 col-start-1"
      >
        &lt; HOME
      </a>
      <div className="row-start-2 col-start-1 border-r pr-6">
        <a href={"./socialMedia/User/" + username} className="text-blue-700">
          YOUR PROFILE
        </a>
      </div>
      {trips.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)] row-start-2 col-start-2">
          No trips found.
        </p>
      ) : (
        <ul className="space-y-3 grid grid-cols-1 gap-6 justify-items-center row-start-2 col-start-2">
          {trips.map((trip) => (
            <li key={trip.id} className="w-full w-full max-w-5xl">
              <SocialMediaCard
                recivecdTrip={trip}
                createdById={trip.createdBy}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
