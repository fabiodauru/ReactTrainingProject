import { useNavigate } from "react-router-dom";
import IconSvg from "../assets/TravelBucket.svg";
import UserSvg from "../assets/User.svg";
import { useUser } from "../context/UserContext";

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
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <div className="flex items-center gap-2">
        <img
          src={IconSvg}
          alt="Travel Bucket Logo"
          className="h-10 cursor-pointer"
          onClick={() => navigate("/")}
        />
      </div>

      <div className="flex items-center gap-2">
        <img
          src={UserSvg}
          alt="User Icon"
          className="h-8 cursor-pointer"
          onClick={() => navigate("/editUser")}
        />
        <span className="text-sm font-medium pr-4">{username}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
