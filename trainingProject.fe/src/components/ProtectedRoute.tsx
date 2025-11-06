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
          credentials: "include",
        });

        if (!response.ok) {
          setStatus("unauthorized");
          console.error("Token check failed with status:", response.status);
          return;
        }

        const data = await response.json();
        if (data.purpose === "PasswordReset") {
          setStatus("reset");
          console.log("Password reset token detected");
        } else if (data.purpose === "Auth") {
          setStatus("auth");
          console.log("Token valid for authentication");
        } else {
          setStatus("unauthorized");
          console.error("Unknown token purpose:", data.purpose);
        }
      } catch {
        setStatus("unauthorized");
        console.error("Error during token check");
      }
    };

    checkToken();
  }, [location.search, location.pathname]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthorized") return <Navigate to="/login" replace />;

  if (status === "reset" && location.pathname !== "/resetPassword") {
    return <Navigate to={`/resetPassword${location.search}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
