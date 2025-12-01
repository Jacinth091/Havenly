import { Key, Mail, Users } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "For Landlords", href: "/landlords" },
    { name: "For Tenants", href: "/tenants" },
  ];

  const teamMembers = [
    "Barral, Jacinth Cedric C.",
    "Espinosa, Revo II",
    "Gulay, Niño Dave",
    "Ybañez, Felix Vincent",
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Grid Layout - 4 columns */}
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Havenly</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Your Digital Rental Haven – Smart Living, Simplified
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>support@havenly.com</span>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Developed by Group 10
            </h3>
            <ul className="space-y-2">
              {teamMembers.map((member) => (
                <li key={member} className="text-gray-400">
                  {member}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p className="text-sm">
            © 2025 Havenly. Information Management Database Systems I
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
