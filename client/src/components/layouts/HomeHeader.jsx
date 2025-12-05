import { Home, Info, Key, LogIn, Menu, User, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Updated links with ID targets instead of routes
  const navLinks = [
    {
      name: "Home",
      target: "top", // Special target for top of page
      type: "scroll",
      icon: <Home className="w-4 h-4" />,
    },
    {
      name: "Features",
      target: "roles", // Matches id="roles" in LandingPage
      type: "scroll",
      icon: <User className="w-4 h-4" />,
    },
    {
      name: "How It Works",
      target: "workflow", // Matches id="architecture" in LandingPage
      type: "scroll",
      icon: <Zap className="w-4 h-4" />,
    },
    {
      name: "About the Team",
      target: "about", // Matches id="roles" in LandingPage
      type: "scroll",
      icon: <Info className="w-4 h-4" />,
    },
  ];

  // Function to handle smooth scrolling
  const handleNavigation = (e, link) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (link.type === "scroll") {
      // If we are not on the home page, go there first
      if (location.pathname !== "/") {
        navigate("/");
        // Wait for navigation to finish before scrolling
        setTimeout(() => {
          scrollToElement(link.target);
        }, 100);
      } else {
        // We are already on home page, just scroll
        scrollToElement(link.target);
      }
    } else {
      // Normal routing for other links (like Login)
      navigate(link.href);
    }
  };

  const scrollToElement = (targetId) => {
    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        // Offset for the fixed header (64px = 4rem = h-16)
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo - always scrolls to top */}
          <a
            href="/"
            onClick={(e) =>
              handleNavigation(e, { type: "scroll", target: "top" })
            }
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-700 transition-colors">
              <Key className="w-4 h-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="block text-lg font-bold text-slate-900 tracking-tight">
                Havenly
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={`#${link.target}`}
                onClick={(e) => handleNavigation(e, link)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>

            <Link
              to="/register"
              className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
            >
              Get Started
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl py-4 px-4 animate-slide-down">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={`#${link.target}`}
                  onClick={(e) => handleNavigation(e, link)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  {link.icon}
                  <span>{link.name}</span>
                </a>
              ))}

              <div className="h-px bg-slate-100 my-2"></div>

              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
