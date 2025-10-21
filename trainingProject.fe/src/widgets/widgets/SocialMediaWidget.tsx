import { Button } from "@/components/ui/button";
import { Hand } from "lucide-react";
import { useNavigate } from "react-router-dom";

type TripItem = {
  tripId: string;
  tripName: string;
  startCoordinates: { latitude: string; longitude: string };
  endCoordinates: { latitude: string; longitude: string };
  description: string;
  createdByUsername: string | null;
  createdByProfilePictureUrl: string | null;
};

export default function SocialMediaWidget({
  trip,
}: {
  trip: TripItem | undefined;
}) {
  const navigate = useNavigate();
  const socialMediaTrip = trip;

  const HandleRedirect = () => {
    navigate("./SocialMedia");
  };

  if (socialMediaTrip == null || undefined)
    return <p>NO Trip found to Display</p>;

  return (
    <div onClick={HandleRedirect}>
      <p className="mb-4 border-b border-[var(--color-muted-foreground)] pb-2">
        SOCIAL MEDIA
      </p>

      <div className="mb-4 border-b border-[var(--color-muted-foreground)] pt-3 pb-2 justify-items-start">
        <p>Trip: {socialMediaTrip?.tripName}</p>
        <p>Description: </p>
        <p className="pb-6 overflow-hidden whitespace-nowrap text-ellipsis block max-w-full">
          {socialMediaTrip?.description}
        </p>
      </div>

      <div className="justify-items-center">
        <img
          className="h-10 mask-circle"
          alt="no profile picture found"
          src={
            socialMediaTrip?.createdByProfilePictureUrl
              ? socialMediaTrip.createdByProfilePictureUrl
              : "src\\assets\\Default_pfp.svg"
          }
        ></img>
        <p>{socialMediaTrip?.createdByUsername}</p>
      </div>
    </div>
  );
}
