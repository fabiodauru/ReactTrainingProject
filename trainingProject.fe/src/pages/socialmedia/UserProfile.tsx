import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DefaultPFP from "../../assets/Default_pfp.svg";
import TripSelector from "@/components/TripSelector";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import type { User } from "@/lib/type";

type UserParams = {
  username: string;
};

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  const navigate = useNavigate();
  const [isLoadingMe, setIsLoadingMe] = useState(true);
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  const [isCheckingFollowing, setIsCheckingFollowing] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [following, setFollowing] = useState<boolean>(false);

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
          console.log(user);

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
      console.log(currentUser);
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
    var data = await res.json();

    if (res.ok && data.followed) {
      setFollowing(true);
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  const handleUnfollow = async () => {
    const res = await fetch(
      `http://localhost:5065/api/User/unfollow/${currentUser.username}`,
      {
        credentials: "include",
      }
    );

    var data = await res.json();

    if (res.ok && data.unfollowed) {
      setFollowing(false);

      toast.success(data.message);
    } else {
      toast.error(data.message);
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

        <h1 className="text-center m-3 text-4xl">
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
        <div className="flex flex-col items-center border-r border-[color:var(--color-muted)] mr-15">
          <div className="border-b border-[color:var(--color-muted)] pb-3">
            <img
              className="h-[10rem] w-fit m-5 rounded-full"
              src={
                currentUser.profilePictureUrl
                  ? currentUser.profilePictureUrl
                  : DefaultPFP
              }
              alt="Profile Picture"
            />
            <h1 className="font-bold text-3xl">{currentUser.username}</h1>
          </div>
          <div className="p-3 border-b">
            <div className="flex flex-col pb-3">
              <label className="font-bold">First name:</label>
              <label>{currentUser.userFirstName}</label>
            </div>
            <div className="flex flex-col pb-3">
              <label className="font-bold">Last name:</label>
              <label>{currentUser.userLastName}</label>
            </div>
            <div className="flex flex-col pb-3">
              <label className="font-bold">A member since:</label>
              <label>{FormatDate(currentUser.joiningDate)}</label>
            </div>
          </div>
          <div className="p-3">
            <div className="flex flex-col pb-3">
              <label className="font-bold">Followers:</label>
              <label>{currentUser.followers.length}</label>
            </div>
            <div className="flex flex-col pb-3">
              <label className="font-bold">Following:</label>
              <label>{currentUser.following.length}</label>
            </div>
          </div>
        </div>
        <div className="TripSelector">
          <TripSelector />
        </div>
      </div>
    </div>
  );
}
