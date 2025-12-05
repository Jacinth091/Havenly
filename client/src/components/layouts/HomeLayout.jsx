import { Outlet } from "react-router-dom";
import Footer from "./HomeFooter";
import Header from "./HomeHeader";

function HomeLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      {/* flex-grow pushes footer down, pt-16 accounts for fixed header height */}
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default HomeLayout;
