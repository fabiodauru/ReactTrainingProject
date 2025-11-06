import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPages/ErrorPage.tsx";
import LoginPage from "./pages/Auth/LoginPage.tsx";
import CreateTripPage from "./pages/Trip/CreateTripPage.tsx";
import ProtectedRoute from "./components/Routing/ProtectedRoute.tsx";
import RegisterPage from "./pages/Auth/RegisterPage.tsx";
import SoziHomepage from "./pages/socialmedia/HomePage.tsx";
import Layout from "./components/layout/layout.tsx";
import TripPage from "./pages/Trip/TripPage.tsx";
import CreateRestaurantPage from "./pages/Restaurant/CreateRestaurantPage.tsx";
import RestaurantPage from "./pages/Restaurant/RestaurantPage.tsx";
import EditUser from "./pages/EditUser/EditUser.tsx";
import UserProfile from "./pages/socialmedia/UserProfile.tsx";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage.tsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route errorElement={<ErrorPage />} />
        <Route path="/*" element={<ErrorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/resetPassword" element={<ResetPasswordPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="trips" element={<TripPage />} />
            <Route path="trips/:tripId" element={<TripPage />} />
            <Route path="createTrips" element={<CreateTripPage />} />
            <Route
              path="registerRestaurant"
              element={<CreateRestaurantPage />}
            />
            <Route path="restaurant" element={<RestaurantPage />} />
            <Route path="editUser" element={<EditUser />} />
          </Route>
          <Route path="/socialMedia" element={<Layout />}>
            <Route index element={<SoziHomepage />} />
            <Route path="user/:username" element={<UserProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
