import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DefaultPFP from "../../assets/Default_pfp.svg";
import TripSelector from "@/components/TripSelector";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

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
  following: string[];
  followers: string[];
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

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  const navigate = useNavigate();
  const [isLoadingMe, setIsLoadingMe] = useState(true);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  const [isCheckingFollowing, setIsCheckingFollowing] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [following, setFollowing] = useState<boolean>(false); //Irgendwo muss denn noh de gsetzt werde bim lade!!

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`http://localhost:5065/api/User/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        const user = data as User;
        setMe(user);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingMe(false);
      }
    })(),
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
          setCurrentUser(user);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingCurrentUser(false);
        }
      })();
  }, []);

  useEffect(() => {
    if (!me || !currentUser) return;
    me.following.forEach((userId) => {
      if (currentUser.id == userId) {
        setFollowing(true);
      }
    });
    setIsCheckingFollowing(false);
  }, [me, currentUser]);

  if (isLoadingCurrentUser || isLoadingMe || isCheckingFollowing)
    return <p>Loading...</p>;
  if (!currentUser || currentUser == null) {
    navigate("./error");
    return; //Muss da weil isso.
  }

  function FormatDate(InputDate: string) {
    const date = new Date(InputDate);
    return date.toLocaleDateString("en-GB");
  }

  const handleFollow = async () => {
    const res = await fetch(
      `http://localhost:5065/api/User/follow/${currentUser.username}`,
      { credentials: "include" }
    );
    if (res.ok) {
      setFollowing(true);
      toast.success(`You are now following user ${currentUser.username}`);
    } else {
      toast.error(`ERROR: Could not follow User ${currentUser.username}.`);
    }
  };

  const handleUnfollow = async () => {
    const res = await fetch(
      `http://localhost:5065/api/User/unfollow/${currentUser.username}`,
      {
        credentials: "include",
      }
    );
    if (res.ok) {
      setFollowing(false);
      console.log(following);

      toast.success(
        `You are not following user ${currentUser.username} anymore`
      );
    } else {
      toast.error(`Could not unfollow user ${currentUser.username}, try again`);
    }
  };

  if (currentUser == null) {
    navigate("../");
    return;
  }
  if (me == null) {
    navigate("../");
    return;
  }

  return (
    <div>
      <Toaster position="top-center" />
      <div className="grid grid-cols-3 items-center">
        <div></div>

        <h1 className="text-center m-3">
          Welcome to the Profile of {currentUser.username}
        </h1>

        <div className="flex justify-end mr-8">
          {following ? (
            <Button onClick={handleUnfollow} className="w-fit bg-gray text-red">
              Following
            </Button>
          ) : (
            <Button onClick={handleFollow} className="w-fit">
              Follow
            </Button>
          )}
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
