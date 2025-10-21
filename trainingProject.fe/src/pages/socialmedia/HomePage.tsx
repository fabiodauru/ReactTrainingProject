import { useEffect, useState } from "react";
import SocialMediaCard from "../../components/SocialMediaCard";

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {trips.length === 0 ? (
        <p className="text-gray-400">No trips found.</p>
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
