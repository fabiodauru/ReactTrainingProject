import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage.tsx";
import Layout from "./layout.tsx";
import TripPage from "./pages/TripPage.tsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route errorElement={<ErrorPage />} />
        <Route path="/*" element={<ErrorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="trips" element={<TripPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
