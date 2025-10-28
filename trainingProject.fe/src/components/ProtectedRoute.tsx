import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "http://localhost:5065/api/Authenticate/check-token",
          {
            method: "GET",
            credentials: "include",
          }
        );
        setIsAuthenticated(response.ok);
      } catch {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>;
  if (isAuthenticated === false) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
