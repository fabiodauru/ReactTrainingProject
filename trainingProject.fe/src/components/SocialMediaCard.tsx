import { useEffect, useState } from "react";

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
    <div>
      <p>{trip.tripName}</p>
      <p>{creator.username}</p>
      <img src={creator.profilePictureUrl} alt="no profile picture" />
    </div>
  );
}
