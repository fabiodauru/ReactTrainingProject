import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DefaultPFP from "../../assets/Default_pfp.svg";
import TripSelector from "@/components/commons/TripSelector";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import type { User } from "@/lib/type";
import { useUser } from "@/context/UserContext";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

type UserParams = {
  username: string;
};

export default function UserProfile() {
  const { username } = useParams<UserParams>();
  const navigate = useNavigate();
  const { user } = useUser() || {};
  const [isLoadingCurrentUser, setIsLoadingCurrentUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [following, setFollowing] = useState<boolean>(false);

  if (username == undefined) {
    navigate("./error");
    return;
  }

  useEffect(() => {
    (async () => {
      try {
        const userData = await api.get<User>(
          `${ENDPOINTS.USER.SOCIAL_MEDIA(username)}`
        );
        setCurrentUser(userData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCurrentUser(false);
      }
    })();
  }, [username]);

  useEffect(() => {
    if (!user || !currentUser) return;
    setFollowing(user.following.includes(currentUser.id));
  }, [user, currentUser]);

  if (isLoadingCurrentUser || !user) return <p>Loading...</p>;

  if (!currentUser) {
    navigate("./error");
    return null;
  }

  function FormatDate(InputDate: string) {
    const date = new Date(InputDate);
    return date.toLocaleDateString("en-GB");
  }

  const handleFollow = async () => {
    try {
      await api.patch<{ followed: boolean; message: string }>(
        `${ENDPOINTS.USER.MANAGE_FOLLOW}`,
        {
          Username: currentUser.username,
          Following: true,
        }
      );

      setFollowing(true);
      toast.success("You are now following " + username);
    } catch (error) {
      toast.error("Failed to follow user");
      console.error(error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await api.patch<{
        unfollowed: boolean;
        message: string;
      }>(`${ENDPOINTS.USER.MANAGE_FOLLOW}`, {
        Username: currentUser.username,
        Following: false,
      });

      setFollowing(false);
      toast.success("You are not following " + username + " anymore");
    } catch (error) {
      toast.error("Failed to unfollow user");
      console.error(error);
    }
  };

  return (
    <div className="bg-[var(--color-background)] text-[color:var(--color-foreground)]">
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
        <div className="flex flex-col items-center border-r border-[color:var(--color-muted-foreground)] mr-15">
          <div className="border-b border-[color:var(--color-muted-foreground)] pb-3">
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
          <div className="p-3 border-b border-[color:var(--color-muted-foreground)]">
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
