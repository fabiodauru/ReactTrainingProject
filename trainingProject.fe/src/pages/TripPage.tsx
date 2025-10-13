import { useEffect, useState } from "react";
import MapWidget from "../widgets/widgets/MapWidget";
import WidgetContainer from "../widgets/WidgetContainer";

type TripItem = {
  id: string | number;
  tripName?: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
};

export default function TripPage() {
  const [trips, setTrips] = useState<TripItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:5065/api/User/Trips", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data?.items) ? data.items : []));
  }, []);

  const latestTrip = trips.at(-1);
  
  const handleNewTrip = () => {
      
  }

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
    <div className="flex justify-between gap-4 p-4">
      <div className="">
        <h1>Map</h1>
        <WidgetContainer size="large">
          {mapProps ? (
            <MapWidget {...mapProps} />
          ) : (
            <p>No trip data available.</p>
          )}
        </WidgetContainer>
      </div>
        <div className="w-screen flex flex-col gap-4">
            <div className="">
                <h1>Your Trips</h1>
                <ul>
                    {[...trips].reverse().map((trip) => (
                        <li key={trip.id}>{trip.tripName}</li>
                    ))}
                </ul>
            </div>
            <div className="flex-col mt-5">
                <button onClick={handleNewTrip}>
                    Create new Trip
                </button>
            </div>
        </div>
    </div>
  );
}
