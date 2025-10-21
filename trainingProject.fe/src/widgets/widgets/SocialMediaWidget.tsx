import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SocialMediaWidget() {
  const navigate = useNavigate();

  const HandleRedirect = () => {
    navigate("./SocialMedia");
  };

  return (
    <div>
      <Button onClick={HandleRedirect}>SOCIAL MEDIA</Button>
    </div>
  );
}
