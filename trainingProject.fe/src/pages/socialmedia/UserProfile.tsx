import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DefaultPFP from "../../assets/Default_pfp.svg";
import TripSelector from "@/components/TripSelector";
import { Button } from "@/components/ui/button";

type UserParams = {
  username: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  birthDay: string;
  firstName: string;
  lastName: string;
  joiningDate: string;
};

type Trip = {
  tripId: string | number;
  tripName?: string | null;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  description?: string | null;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
  distance?: number;
  duration?: string;
  difficulty?: number;
  elevation?: number;
};

type TripImage = {
  ImageFile: string;
  Description: string;
};

type MapProps = {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  tripId?: string | number;
};

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  const navigate = useNavigate();

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);
  const [currentUser, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5065/api/User/socialMedia/${username}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const user = data as User;
        setUser(user);

        console.log(user);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingUser(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5065/api/Trips/${username}`, {
          credentials: "include",
        });
        const data = await res.json();

        const items = data as Trip[];
        setTrips(items);
        console.log(trips);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTrips(false);
      }
    })();
  }, []);

  if (isLoadingUser || isLoadingTrips) return <p>Loading...</p>;
  if (!currentUser || currentUser == null) {
    navigate("./error");
    return; //Muss da weil isso.
    // Muess dete sii dasi nöd immer so dummi fragezeiche mue setze.
  }

  function FormatDate(InputDate: string) {
    const date = new Date(InputDate);
    return date.toLocaleDateString("en-GB");
  }

  const handleFollow = async () => {
    const res = await fetch(
      `http://localhost:5065/api/User/follow/${username}`,
      { credentials: "include" }
    );
    console.log(res);
  };

  return (
    <div>
      <div className="grid grid-cols-3 items-center">
        <div></div>

        <h1 className="text-center m-3">
          Welcome to the Profile of {currentUser.username}
        </h1>

        <div className="flex justify-end mr-8">
          <Button onClick={handleFollow} className="w-fit">
            Follow
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-[5fr_15fr_1fr] m-5">
        <div className="flex flex-col items-center">
          <div className="border-b border-[color:var(--color-muted)] pb-3">
            <img
              className="h-[10rem] w-fit m-5"
              src={
                currentUser.profilePicture
                  ? currentUser.profilePicture
                  : DefaultPFP
              }
              alt="Profile Picture"
            />
            <h1>{currentUser.username}</h1>
          </div>
          <div className="p-3 border-b">
            <div className="flex flex-col pb-3">
              <label>First name:</label>
              <label>{currentUser.firstName}</label>
            </div>
            <div className="flex flex-col pb-3">
              <label>Last name:</label>
              <label>{currentUser.firstName}</label>
            </div>
            <div className="flex flex-col pb-3">
              <label>A member since:</label>
              <label>{FormatDate(currentUser.joiningDate)}</label>
            </div>
          </div>
          <div className="p-3">
            <p>HELOOOO</p>
          </div>
        </div>
        <div className="TripSelector">
          <TripSelector />
        </div>
      </div>
    </div>
  );
}
