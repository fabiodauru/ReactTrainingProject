import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [status, setStatus] = useState<
    "loading" | "auth" | "reset" | "unauthorized"
  >("loading");
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        const url = token
          ? `http://localhost:5065/api/Authenticate/check-token?token=${encodeURIComponent(
              token
            )}`
          : "http://localhost:5065/api/Authenticate/check-token";

        const response = await fetch(url, {
          method: "GET",
          credentials: token ? "omit" : "include",
        });

        if (!response.ok) {
          setStatus("unauthorized");
          return;
        }

        const data = await response.json();
        if (data.purpose === "PasswordReset") setStatus("reset");
        else if (data.purpose === "Auth") setStatus("auth");
        else setStatus("unauthorized");
      } catch {
        setStatus("unauthorized");
      }
    };

    checkToken();
  }, [location]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthorized") return <Navigate to="/login" replace />;
  if (status === "reset") return <Navigate to="/resetPassword" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
