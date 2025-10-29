import WidgetContainer from "@/widgets/WidgetContainer";
import MapWidget from "@/widgets/widgets/MapWidget";
import { useEffect, useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Button } from "./ui/button";

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
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  birthday: string;
  userFirstName: string;
  userLastName: string;
  joiningDate: string;
  following: string[];
  followers: string[];
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

  const mapProps = trip
    ? {
        start: {
          lat: Number(trip.startCoordinates.latitude),
          lng: Number(trip.startCoordinates.longitude),
        },
        end: {
          lat: Number(trip.endCoordinates.latitude),
          lng: Number(trip.endCoordinates.longitude),
        },
        tripId: trip.id,
      }
    : undefined;

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
    <div className="bg-background rounded-lg p-3 flex-row">
      <div className="justify-items-start">
        <div className="flex flex-row justify-items-start">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" className="mt-5 hover:no-underline">
                <img
                  src={creator.profilePictureUrl}
                  className="h-10 rounded-full object-cover "
                  alt="no profile picture found"
                />
                <a
                  href={"./socialMedia/user/" + creator.username}
                  className="text-foreground m-2 decoration-none hover:no-underline"
                >
                  {creator.username}
                </a>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="text-foreground bg-[color:var(--color-background)] p-5">
              <div>
                <div className="flex justify-start items-center gap-3 pb-3 border-b pb-5">
                  <img
                    className="w-[2.5rem] rounded-full"
                    src={creator.profilePictureUrl}
                    alt="UserProfilePicture"
                  />
                  <p>{creator.username}</p>
                </div>
                <div className="flex gap-3 pt-3">
                  <label htmlFor="followers">Followers: </label>
                  <p id="followers">{creator.followers.length}</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      <br />
      <p className="text-foreground">{trip.tripName}</p>
      <br />
      <div className="grid grid-cols-2">
        <div className="p-2">
          <WidgetContainer>
            {mapProps ? (
              <MapWidget {...mapProps} />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                {"Select a trip to see it on the map."}
              </div>
            )}
          </WidgetContainer>
        </div>
        <div className="justify-items-start p-2">
          <p className="text-white">
            Distance: {formatDistance(trip.distance)}
          </p>
          <p className="text-white">
            Duration: {formatDuration(trip.duration)}
          </p>
          <p className="text-white"> Description:</p>
          <p className="text-white"> {trip.description}</p>
        </div>
      </div>
    </div>
  );
}

function formatDuration(duration?: string): string {
  if (!duration) return "";
  let days = 0,
    hours = 0,
    minutes = 0;
  let match = duration.match(/^(\d+)\.(\d{1,2}):(\d{2}):/);
  if (match) {
    days = Number(match[1]);
    hours = Number(match[2]);
    minutes = Number(match[3]);
  } else {
    match = duration.match(/^(\d{1,2}):(\d{2}):/);
    if (match) {
      hours = Number(match[1]);
      minutes = Number(match[2]);
    }
  }
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.length ? parts.join(" ") : "0m";
}

function formatDistance(distance?: number): string {
  if (distance == null) return "—";
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)} km`;
  }
  return `${distance.toFixed(0)} m`;
}
