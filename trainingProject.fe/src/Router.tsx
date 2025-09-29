import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ErrorPage from "./pages/ErrorPage";

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="" element={<HomePage/>} />
                <Route errorElement={<ErrorPage/>}/>
                <Route path="/*" element={<ErrorPage/>} />
            </Routes>
        </BrowserRouter>
    )
}