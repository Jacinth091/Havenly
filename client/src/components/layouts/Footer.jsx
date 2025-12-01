import { Key, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

function Footer() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "For Landlords", href: "/landlords" },
    { name: "For Tenants", href: "/tenants" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ];

  const teamMembers = [
    "Barral, Jacinth Cedric C.",
    "Espinosa, Revo II",
    "Gulay, Niño Dave",
    "Ybañez, Felix Vincent",
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Havenly</h2>
            </div>
            <p className="text-gray-400 text-sm">
              Your Digital Rental Haven – Smart Living, Simplified
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <a
                  href="mailto:support@havenly.com"
                  className="hover:text-white transition-colors hover:underline"
                >
                  support@havenly.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <a
                  href="tel:+15551234567"
                  className="hover:text-white transition-colors hover:underline"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <p className="text-sm pt-2">
                © 2025 Havenly. All rights reserved.
                <br />
                Information Management Database Systems I
              </p>
            </div>
          </div>
        </div>

        {/* Team Credits */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <h4 className="text-lg font-semibold mb-4 text-center">
            Developed by Group 10
          </h4>
          <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-sm">
            {teamMembers.map((member, index) => (
              <div
                key={member}
                className="flex items-center space-x-1 bg-gray-800/50 px-3 py-2 rounded-lg"
              >
                <span className="text-blue-400">•</span>
                <span>{member}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
