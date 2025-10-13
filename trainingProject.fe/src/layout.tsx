import Footer from "./components/Footer";
import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

const Layout = () => {
  return (
    <UserProvider>
      <div className="flex h-screen w-full flex-col">
        <Header />
        <main className="w-full flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </UserProvider>
  );
};

export default Layout;
