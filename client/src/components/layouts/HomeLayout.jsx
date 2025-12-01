import { Outlet } from "react-router-dom";
import Footer from "../layouts/Footer";
import Header from "../layouts/Header";

function HomeLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default HomeLayout;
