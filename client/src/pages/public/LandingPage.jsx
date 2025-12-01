import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle,
  ChevronDown,
  CreditCard,
  Key,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
const LandingPage = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.98]);

  // Highlight features that match your Header navigation
  const heroFeatures = [
    {
      icon: Building2,
      title: "Property Management",
      description: "Manage multiple properties with ease",
      link: "/landlords",
    },
    {
      icon: Users,
      title: "Tenant Portal",
      description: "Tenants can view leases and payments",
      link: "/tenants",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Role-based access control",
      link: "/features",
    },
  ];

  const stats = [
    { number: "100%", label: "Local Data Security" },
    { number: "3", label: "User Roles" },
    { number: "∞", label: "Properties Managed" },
    { number: "24/7", label: "Accessibility" },
  ];

  const testimonials = [
    {
      name: "John Smith",
      role: "Property Manager",
      content:
        "Havenly revolutionized how we manage our 15 rental properties. The tenant tracking feature alone saved us 10+ hours weekly.",
      rating: 5,
      type: "landlord",
    },
    {
      name: "Sarah Johnson",
      role: "Tenant",
      content:
        "As a tenant, I love how easy it is to view my lease and payment history. The platform is very user-friendly!",
      rating: 5,
      type: "tenant",
    },
    {
      name: "Michael Chen",
      role: "Real Estate Investor",
      content:
        "Managing multiple properties used to be chaotic. Havenly's centralized system has been a game-changer for my business.",
      rating: 5,
      type: "landlord",
    },
  ];

  const scrollToCTAs = () => {
    document
      .getElementById("cta-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative overflow-hidden"
      >
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                    🏡 Your Digital Rental Haven
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Smart Living,
                  <span className="text-blue-600"> Simplified</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600">
                  Havenly is a comprehensive web-based rental management system
                  that streamlines property management, tenant tracking, and
                  rent payments. Built with MySQL and XAMPP for secure, local
                  database management.
                </p>

                {/* Hero Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  {heroFeatures.map((feature, index) => (
                    <Link
                      key={index}
                      to={feature.link}
                      className="flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                        <feature.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {feature.description}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={scrollToCTAs}
                    className="inline-flex items-center justify-center gap-2 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Explore Features
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-1 shadow-2xl">
                  <div className="bg-white rounded-xl p-6 md:p-8">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Havenly Dashboard
                            </h3>
                            <p className="text-sm text-gray-600">
                              Role-Based Interface
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                              For Landlords
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            Manage
                          </p>
                          <p className="text-sm text-gray-600">
                            Properties & Tenants
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">
                              For Tenants
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-900">
                            View
                          </p>
                          <p className="text-sm text-gray-600">
                            Leases & Payments
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Quick Actions</span>
                          <span className="text-blue-600 font-medium">
                            All Features
                          </span>
                        </div>
                        {[
                          {
                            icon: Building2,
                            text: "Add New Property",
                            color: "blue",
                          },
                          {
                            icon: Users,
                            text: "Register Tenant",
                            color: "green",
                          },
                          {
                            icon: CreditCard,
                            text: "Record Payment",
                            color: "purple",
                          },
                        ].map((action, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-8 h-8 bg-${action.color}-100 rounded-full flex items-center justify-center`}
                              >
                                <action.icon
                                  className={`w-4 h-4 text-${action.color}-600`}
                                />
                              </div>
                              <span className="font-medium text-gray-900">
                                {action.text}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-gray-900">
                  {stat.number}
                </p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Role-Based CTA Section */}
      <section id="cta-section" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              👥 Choose Your Role
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-gray-600 text-lg">
              Havenly provides specialized interfaces for different user roles
              in the rental ecosystem.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* For Landlords Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Landlords
                  </h3>
                  <p className="text-blue-600">Property Management</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Property & Room Management",
                  "Tenant Registration",
                  "Lease Agreement Tracking",
                  "Payment Recording",
                  "Financial Reports",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/landlords"
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Explore Landlord Features
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>

            {/* For Tenants Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-200 p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    For Tenants
                  </h3>
                  <p className="text-green-600">Rental Experience</p>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "View Lease Details",
                  "Payment History",
                  "Maintenance Requests",
                  "Direct Messaging",
                  "Document Access",
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/tenants"
                className="inline-flex items-center justify-center w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Explore Tenant Features
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>

          {/* All Features CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              to="/features"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All System Features
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
              ⭐ What Users Say
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Landlords & Tenants
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      testimonial.type === "landlord"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {testimonial.type === "landlord" ? "Landlord" : "Tenant"}
                  </span>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      testimonial.type === "landlord"
                        ? "bg-blue-100"
                        : "bg-green-100"
                    }`}
                  >
                    {testimonial.type === "landlord" ? (
                      <Key className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Users className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Your Digital Rental Journey
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Whether you're a landlord or tenant, Havenly simplifies your
              rental experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
              >
                Sign In to Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Havenly</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your Digital Rental Haven – Smart Living, Simplified
              </p>
              <div className="flex space-x-4 mt-6">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 hover:text-white transition"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {["Product", "Company", "Support", "Legal"].map(
              (category, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-lg mb-4">{category}</h4>
                  <ul className="space-y-2 text-gray-400">
                    {["Features", "Pricing", "Documentation"]
                      .slice(0, 3)
                      .map((item, idx) => (
                        <li key={idx}>
                          <a
                            href="#"
                            className="hover:text-white transition text-sm"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              )
            )}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 Havenly - Group 10. All rights reserved.</p>
            <p className="mt-2">
              Built with MySQL + XAMPP for secure local database management
            </p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default LandingPage;
