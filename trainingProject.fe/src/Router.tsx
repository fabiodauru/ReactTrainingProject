import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";
import LoginPage from "./pages/LoginPage.tsx";

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="" element={<HomePage/>} />
                <Route path="/login" element={<LoginPage />} ></Route>
                <Route errorElement={<ErrorPage/>}/>
                <Route path="/*" element={<ErrorPage/>} />
            </Routes>
        </BrowserRouter>
    )
}