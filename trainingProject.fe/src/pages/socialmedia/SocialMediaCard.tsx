import WidgetContainer from "@/components/layout/WidgetContainer";
import MapWidget from "@/components/commons/MapWidget";
import { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card";
import { useUser } from "../../context/UserContext";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Trip, User } from "@/lib/type";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function SocialMediaCard({
  recivecdTrip,
  createdById,
}: {
  recivecdTrip: Trip;
  createdById: string;
}) {
  const [creator, setCreator] = useState<User | null>(null);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const trip = recivecdTrip;
  const navigate = useNavigate();
  const { user } = useUser() || {};

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
        const recivedCreator: User = await api.get(
          ENDPOINTS.USER.BY_ID(createdById)
        );

        if (user == null) return;

        user.bookedTrips.forEach((tripId) => {
          if (trip.id == tripId) {
            setBookmarked(true);
          }
        });
        setCreator(recivedCreator);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [createdById]);

  const HandleBookmark = async () => {
    try {
      if (createdById == user?.id) {
        setBookmarked(false);
        return;
      }

      await api.patch(`${ENDPOINTS.TRIP.BOOKMARK}`, {
        TripId: recivecdTrip.id,
        Bookmarking: !bookmarked,
      });
      setBookmarked(!bookmarked);
    } catch (error) {
      console.error(error);
    }
  };

  if (creator == null) return;

  const handleProfileClick = async () => {
    navigate("./user/" + creator.username);
  };

  if (creator.profilePictureUrl == null)
    creator.profilePictureUrl = "src\\assets\\Default_pfp.svg";

  return (
    <div className="bg-[var(--color-muted)] rounded-lg p-3 flex-row click:bg-blue-500">
      <div className="flex items-center place-content-between">
        <div className="flex flex-row justify-items-start">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button
                variant="link"
                className="mt-5 hover:no-underline"
                onClick={handleProfileClick}
              >
                <img
                  src={creator.profilePictureUrl}
                  className="h-10 rounded-full object-cover "
                  alt="no profile picture found"
                />
                <p className="text-foreground m-2 decoration-none hover:no-underline">
                  {creator.username}
                </p>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="text-foreground bg-[color:var(--color-background)] p-5">
              <div>
                <div className="flex justify-start items-center gap-3 pb-3 border-b">
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
        <div className="mt-5 mr-5">
          {bookmarked ? (
            <Bookmark
              color="var(--color-accent)"
              fill="var(--color-accent)"
              onClick={HandleBookmark}
            />
          ) : (
            <Bookmark color="white" fill="white" onClick={HandleBookmark} />
          )}

          {/* <BookmarkCheck color="var(--color-accent)" fill="red" />
            Wanted to create an animation
          */}
        </div>
      </div>
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

function formatDuration(duration?: string | number): string {
  if (duration == null) return "";
  const durationString =
    typeof duration === "number" ? duration.toString() : duration;
  let days = 0,
    hours = 0,
    minutes = 0;
  let match = durationString.match(/^(\d+)\.(\d{1,2}):(\d{2}):/);
  if (match) {
    days = Number(match[1]);
    hours = Number(match[2]);
    minutes = Number(match[3]);
  } else {
    match = durationString.match(/^(\d{1,2}):(\d{2}):/);
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
