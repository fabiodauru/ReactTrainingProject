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
    <div className="p-6 grid grid-cols-[1fr_15fr_1fr] gap-4">
      <div>
        <a href="./"> &lt; HOME </a>
        <a href={"./socialMedia/User/" + username}> YOUR PROFILE </a>
      </div>
      {trips.length === 0 ? (
        <p className="text-[var(--color-muted-foreground)]">No trips found.</p>
      ) : (
        <ul className="space-y-3 grid grid-cols-1 gap-6 justify-items-center">
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
