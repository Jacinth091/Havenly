import { Key, Mail, MapPin, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

function Footer() {
  const location = useLocation();
  const navigate = useNavigate();

  // Updated links to match Landing Page Section IDs
  const navLinks = [
    { name: "Home", target: "top" },
    { name: "Features", target: "roles" }, // Links to the Role Tabs
    { name: "How It Works", target: "workflow" }, // Links to the Workflow/Demo section
    { name: "About Team", target: "about" }, // Links to Team Cards
  ];

  const teamMembers = [
    "Barral, Jacinth Cedric C.",
    "Espinosa, Revo II",
    "Gulay, Niño Dave",
    "Ybañez, Felix Vincent",
  ];

  // Smooth Scroll Handler (Same as Header)
  const handleNavigation = (e, targetId) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        scrollToElement(targetId);
      }, 100);
    } else {
      scrollToElement(targetId);
    }
  };

  const scrollToElement = (targetId) => {
    if (targetId === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
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
    <footer className="bg-slate-950 text-white border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
                <Key className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Havenly</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your Digital Rental Haven – Smart Living, Simplified. Secure local
              management for modern properties.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Platform
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={`#${link.target}`}
                    onClick={(e) => handleNavigation(e, link.target)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-sm cursor-pointer"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>support@havenly.com</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm hover:text-white transition-colors">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Cebu City, Philippines</span>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Group 10
            </h3>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <li
                  key={member}
                  className="text-slate-400 text-xs hover:text-emerald-400 transition-colors cursor-default"
                >
                  {member}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-slate-500 text-sm">
            © 2025 Havenly. Information Management Database Systems I.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              React
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              MySQL
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
              XAMPP
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
