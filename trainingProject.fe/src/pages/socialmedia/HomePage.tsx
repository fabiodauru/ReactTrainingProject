import React, { useEffect, useState } from "react";
import { data } from "react-router-dom";

type Trip = {
  id: string | number;
  tripName?: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  distance?: number;
  duration?: string;
  description?: string;
};

type TripItem = {
  trip: Trip;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

type MapProps = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  tripId?: string | number;
};

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("http://localhost:5065/Trips", {
          credentials: "include",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        const items = Array.isArray(data.result.trips)
          ? (data.result.trips as Trip[])
          : [];
        setTrips(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false); // <-- important
      }
    })();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      {trips.length === 0 ? (
        <p>No trips found.</p>
      ) : (
        <ul className="space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="p-3 rounded-lg shadow bg-gray-100">
              <h2 className="font-bold text-lg">{trip.tripName}</h2>
              <p>{trip.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
