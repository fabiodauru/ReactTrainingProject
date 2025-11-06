import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Trip, User } from "@/lib/type";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export default function SocialMediaWidget({
  trip,
}: {
  trip: Trip | undefined;
}) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trip?.createdBy) {
      fetchUser(trip.createdBy);
    }
  }, [trip?.createdBy]);

  const fetchUser = async (userId: string) => {
    setLoading(true);
    try {
      const response = await api.get<User>(ENDPOINTS.USER.BY_ID(userId));
      setUser(response);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const HandleRedirect = () => {
    navigate("./SocialMedia");
  };

  if (!trip) {
    return (
      <div className="flex h-full items-center justify-center text-[color:var(--color-muted-foreground)]">
        No trip found to display
      </div>
    );
  }

  return (
    <div onClick={HandleRedirect} className="cursor-pointer">
      <p className="mb-4 border-b border-[var(--color-muted-foreground)] pb-2">
        SOCIAL MEDIA
      </p>

      <div className="mb-4 border-b border-[var(--color-muted-foreground)] pt-3 pb-2 justify-items-start">
        <p>Trip: {trip.tripName}</p>
        <p>Description: </p>
        <p className="pb-6 overflow-hidden whitespace-nowrap text-ellipsis block max-w-full">
          {trip.description || "No description available"}
        </p>
      </div>

      <div className="justify-items-center">
        {loading ? (
          <div className="h-10 w-10 rounded-full animate-pulse bg-[color:var(--color-muted)]" />
        ) : (
          <img
            className="h-10 w-10 rounded-full object-cover"
            alt="Profile picture"
            src={user?.profilePictureUrl || "/src/assets/Default_pfp.svg"}
          />
        )}
        <p>{user?.username || trip.createdBy || "Loading..."}</p>
      </div>
    </div>
  );
}
