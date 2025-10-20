import MapWidget from "@/widgets/widgets/MapWidget";
import { useEffect, useMemo, useState } from "react";

type Trip = {
  id: string | number;
  tripName?: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  distance?: number;
  duration?: string;
  description?: string;
};

type User = {
  id: string | number;
  username: string;
  profilePictureUrl: string | null;
};

type MapProps = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  tripId?: string | number;
};

export default function SocialMediaCard({
  recivecdTrip,
  createdById,
}: {
  recivecdTrip: Trip;
  createdById: string;
}) {
  const [creator, setCreator] = useState<User | null>(null);
  const trip = recivecdTrip;

  const mapProps: MapProps | undefined = useMemo(() => {
    if (!trip) return undefined;
    return {
      start: {
        lat: Number(trip.startCoordinates.latitude),
        lng: Number(trip.startCoordinates.longitude),
      },
      end: {
        lat: Number(trip.endCoordinates.latitude),
        lng: Number(trip.endCoordinates.longitude),
      },
      tripId: trip.id,
    };
  }, [trip]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `http://localhost:5065/api/User/${createdById}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();
        const user = data as User;

        setCreator(user);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  if (creator == null) return;
  if (creator.profilePictureUrl == null)
    creator.profilePictureUrl = "src\\assets\\Default_pfp.svg";

  return (
    <div className="bg-background rounded-lg p-3 flex-row items-center">
      <div className="flex flex-row justify-center items-center">
        <img
          src={creator.profilePictureUrl}
          className="h-10 mask-circle"
          alt="no profile picture found"
        />
        <p className="text-foreground m-3">{creator.username}</p>
      </div>
      <br />
      <p className="text-foreground">{trip.tripName}</p>
      <br />
      {mapProps ? (
        <MapWidget {...mapProps} />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-500">
          {"Select a trip to see it on the map."}
        </div>
      )}
    </div>
  );
}
