import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5065/api/Authenticate/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");

      navigate("/login");
    } catch (err) {
      console.error("Logout fehlgeschlagen", err);
    }
  };

  return (
    <header className="p-4 bg-gray-800 text-white flex justify-between items-center">
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
