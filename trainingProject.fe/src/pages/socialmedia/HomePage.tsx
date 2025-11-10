import SearchUserComponent from "@/components/SearchUserComponent";
import SocialMediaCard from "../socialmedia/SocialMediaCard";
import { useUser } from "../../context/UserContext";
import { useEffect, useState } from "react";
import type { Trip } from "@/lib/type";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchIsOpen, setSearchIsOpen] = useState<boolean>(false);
  const { user } = useUser() || {};

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get<Trip[]>(ENDPOINTS.TRIP.LIST);
      setTrips(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAbortSearch = () => {
    setSearchIsOpen(false);
  };

  if (!user || !trips)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-accent)] border-r-transparent"></div>
          <p className="mt-4 text-[var(--color-muted-foreground)]">
            Loading...
          </p>
        </div>
      </div>
    );

  return (
    <div
      className="p-6 grid grid-cols-[1fr_15fr_1fr] grid-rows-[4rem_1fr] gap-4 min-h-screen items-center bg-[var(--color-background)]"
      onClick={handleAbortSearch}
    >
      <div
        className="row-start-1 col-start-2 justify-items-center z-1"
        onClick={(e) => e.stopPropagation()}
      >
        <SearchUserComponent
          searchIsOpen={searchIsOpen}
          setSearchIsOpen={setSearchIsOpen}
        />
      </div>
      <a
        href="../"
        className="flex flex-col justify-start row-start-1 col-start-1 text-[var(--color-muted-foreground)]"
      >
        &lt; HOME
      </a>
      <div className="row-start-2 col-start-1 border-r pr-6">
        <a
          href={"./socialMedia/User/" + user.username}
          className="text-blue-700"
        >
          YOUR PROFILE
        </a>
      </div>
      <div className="col-start-2">
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
    </div>
  );
}
