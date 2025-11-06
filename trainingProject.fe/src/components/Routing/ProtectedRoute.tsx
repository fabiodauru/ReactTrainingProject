import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "@/api/api";
import { ENDPOINTS } from "@/api/endpoints";

type TokenCheckResponse = {
  purpose: "PasswordReset" | "Auth" | string;
};

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

        const endpoint = token
          ? `${ENDPOINTS.AUTH.CHECK_TOKEN}?token=${encodeURIComponent(token)}`
          : ENDPOINTS.AUTH.CHECK_TOKEN;

        const data = await api.get<TokenCheckResponse>(endpoint);

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
      } catch (error) {
        setStatus("unauthorized");
        console.error("Error during token check:", error);
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
