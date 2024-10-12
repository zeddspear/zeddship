import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppProvider } from "../context/AppContext";

function MainLayout() {
  return (
    <AppProvider>
      <Navbar />
      <Outlet />
    </AppProvider>
  );
}

export default MainLayout;
