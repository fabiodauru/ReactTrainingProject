import { useNavigate } from "react-router-dom";
import IconSvg from "../assets/TravelBucket.svg";
import UserSvg from "../assets/User.svg";
import { useUser } from "../context/UserContext";
import { Button } from "./ui/button";

export default function Header() {
  const navigate = useNavigate();
  const { username } = useUser() || {};

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5065/api/Authenticate/logout", {
        method: "POST",
        credentials: "include",
      });

      navigate("/login");
    } catch (err) {
      console.error("Logout fehlgeschlagen", err);
    }
  };

  return (
    <header className="p-4 bg-[color:var(--color-primary)] text-[color:var(--color-foreground)] flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src={IconSvg}
          alt="Travel Bucket Logo"
          className="h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="flex items-center gap-2">
        <img src={UserSvg} alt="User Icon" className="h-8" />
        <span className="text-sm font-medium pr-4 text-[color:var(--color-foreground)]">
          {username}
        </span>
        <Button onClick={handleLogout} variant="destructive">
          Logout
        </Button>
      </div>
    </header>
  );
}
