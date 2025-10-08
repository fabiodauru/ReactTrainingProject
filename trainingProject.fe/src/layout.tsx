import Footer from "./components/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="w-full p-4 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
