import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import RegisterPage from "./pages/RegisterPage.tsx";

export default function Router() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route errorElement={<ErrorPage />} />
        <Route path="/*" element={<ErrorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
