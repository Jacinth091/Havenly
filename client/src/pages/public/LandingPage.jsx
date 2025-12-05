import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Code2,
  CreditCard,
  Database,
  FileText,
  Github,
  GraduationCap,
  History,
  LayoutDashboard,
  Linkedin,
  Lock,
  LogIn,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [activeTab, setActiveTab] = useState("landlord");
  const [activeWorkflow, setActiveWorkflow] = useState("landlord");
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  // --- FEATURE DATA (Role Section) ---
  const landlordFeatures = [
    {
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
      title: "Property & Room CRUD",
      description:
        "Full capability to add, view, edit, and delete property information and room details directly.",
    },
    {
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      title: "Tenant Registration",
      description:
        "Register new tenants and manage their profiles with secure, role-based access control.",
    },
    {
      icon: CreditCard,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      title: "Manual Payment Recording",
      description:
        "Manually record rent payments with reference numbers since external gateways are excluded.",
    },
    {
      icon: FileText,
      color: "text-pink-600",
      bg: "bg-pink-100",
      title: "Lease Management",
      description:
        "Create lease agreements that automatically expire based on end dates.",
    },
  ];

  const tenantFeatures = [
    {
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      title: "View Lease Details",
      description:
        "Access your active lease agreement terms, monthly rent amount, and due dates instantly.",
    },
    {
      icon: History,
      color: "text-teal-600",
      bg: "bg-teal-100",
      title: "Payment History",
      description:
        "View a complete log of your past rent payments and check their verification status.",
    },
    {
      icon: Bell,
      color: "text-orange-600",
      bg: "bg-orange-100",
      title: "Room Status",
      description:
        "See real-time updates on your room's occupancy status and maintenance flags.",
    },
    {
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-100",
      title: "Profile Management",
      description:
        "Keep your personal contact information up to date for your landlord's records.",
    },
  ];

  const adminFeatures = [
    {
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-100",
      title: "User Management",
      description:
        "Full control to activate, deactivate, or update user accounts (Landlords & Tenants) system-wide.",
    },
    {
      icon: Database,
      color: "text-slate-600",
      bg: "bg-slate-100",
      title: "Database Maintenance",
      description:
        "Direct oversight of the local MySQL database structure, integrity constraints, and backups.",
    },
    {
      icon: Lock,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      title: "Security Oversight",
      description:
        "Monitor system access logs, ensure role-based permissions are enforced, and audit data changes.",
    },
    {
      icon: Settings,
      color: "text-rose-600",
      bg: "bg-rose-100",
      title: "System Configuration",
      description:
        "Manage global system settings, defaults, and overall platform health from a central dashboard.",
    },
  ];

  // --- WORKFLOW DATA (Demo Section) - UPDATED TO 4 STEPS EACH ---
  const workflows = {
    landlord: [
      {
        step: 1,
        title: "Setup Properties",
        desc: "Add properties and individual rooms to the system.",
        icon: Building2,
      },
      {
        step: 2,
        title: "Onboard Tenant",
        desc: "Register a tenant profile linked to a user account.",
        icon: UserPlus,
      },
      {
        step: 3,
        title: "Create Lease",
        desc: "Assign a tenant to a room and define lease terms.",
        icon: FileText,
      },
      {
        step: 4,
        title: "Record Payment",
        desc: "Log monthly rent payments manually with receipt #.",
        icon: CreditCard,
      },
    ],
    tenant: [
      {
        step: 1,
        title: "Secure Login",
        desc: "Log in via the local network to access your dashboard.",
        icon: LogIn,
      },
      {
        step: 2,
        title: "View Active Lease",
        desc: "Check your current rent amount and due dates.",
        icon: ClipboardList,
      },
      {
        step: 3,
        title: "Check History",
        desc: "Verify that your last payment was recorded correctly.",
        icon: History,
      },
      {
        step: 4,
        title: "Profile Status",
        desc: "Ensure your contact info is up to date for the landlord.",
        icon: Users,
      },
    ],
    admin: [
      {
        step: 1,
        title: "System Oversight",
        desc: "Monitor active users and overall system status.",
        icon: LayoutDashboard,
      },
      {
        step: 2,
        title: "Manage Users",
        desc: "Create or Deactivate Landlord/Tenant accounts.",
        icon: ShieldCheck,
      },
      {
        step: 3,
        title: "Data Audit",
        desc: "Review soft-deleted records and timestamps.",
        icon: Database,
      },
      {
        step: 4,
        title: "System Config",
        desc: "Configure global settings and maintain platform health.",
        icon: Settings, // New 4th step added here [cite: 18]
      },
    ],
  };

  // Group 10 Members Data
  const teamMembers = [
    {
      name: "Jacinth Cedric C. Barral",
      role: "System Developer",
      image: "https://ui-avatars.com/api/?name=Jacinth+Barral&background=059669&color=fff&size=200",
    },
    {
      name: "Revo II Espinosa",
      role: "System Developer",
      image: "https://ui-avatars.com/api/?name=Revo+Espinosa&background=059669&color=fff&size=200",
    },
    {
      name: "Niño Dave Gulay",
      role: "System Developer",
      image: "https://ui-avatars.com/api/?name=Nino+Gulay&background=059669&color=fff&size=200",
    },
    {
      name: "Felix Vincent Ybañez",
      role: "System Developer",
      image: "https://ui-avatars.com/api/?name=Felix+Ybanez&background=059669&color=fff&size=200",
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity }}
        className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-6">
                <Database size={12} className="text-emerald-600" />
                Local MySQL Database System
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Rental Management <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  Simplified.
                </span>
              </h1>

              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                The secure, web-based platform for Landlords and Tenants. Track
                payments, manage leases, and organize properties—all powered by
                a robust local XAMPP server.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-200"
                >
                  Access Dashboard <ArrowRight size={18} />
                </Link>
                <a
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all hover:border-slate-300"
                >
                  View Features
                </a>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" /> No
                  Cloud Deployment
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" /> Local
                  Data Privacy
                </span>
              </div>
            </motion.div>

            {/* Right Visuals (Abstract UI) */}
            <motion.div
              style={{ y: heroY }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main Card */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-6 flex flex-col gap-4 z-20">
                  {/* Fake UI Header */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="h-2 w-20 bg-slate-200 rounded-full"></div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-2">
                        <Building2 size={18} />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        12
                      </div>
                      <div className="text-xs text-slate-500">
                        Active Properties
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-2">
                        <Users size={18} />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">
                        24
                      </div>
                      <div className="text-xs text-slate-500">
                        Total Tenants
                      </div>
                    </div>
                  </div>

                  {/* List Items */}
                  <div className="space-y-3 mt-2 flex-1 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-24 bg-slate-200 rounded"></div>
                          <div className="h-1.5 w-16 bg-slate-100 rounded"></div>
                        </div>
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">
                          PAID
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -top-6 -right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl z-30 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        System Status
                      </p>
                      <p className="font-bold">Secure & Active</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* --- ROLE SWITCHER SECTION (Static Features) --- */}
      <section id="roles" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Core Capabilities
            </h2>

            {/* Tab Switcher */}
            <div className="inline-flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-8 relative">
              <button
                onClick={() => setActiveTab("landlord")}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                  activeTab === "landlord"
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                For Landlords
                {activeTab === "landlord" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-900 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("tenant")}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                  activeTab === "tenant"
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                For Tenants
                {activeTab === "tenant" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-emerald-600 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("admin")}
                className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
                  activeTab === "admin"
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                For Admins
                {activeTab === "admin" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-blue-600 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {(activeTab === "landlord"
                  ? landlordFeatures
                  : activeTab === "tenant"
                  ? tenantFeatures
                  : adminFeatures
                ).map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-default"
                  >
                    <div
                      className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                    >
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- SYSTEM WORKFLOW SECTION (Interactive Demo) --- */}
      <section
        id="workflow"
        className="py-24 bg-slate-900 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-900/20 to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-6 tracking-wider">
              <Zap size={14} /> SYSTEM WORKFLOW
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              How Havenly Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A step-by-step walkthrough of the key processes for each user role in the system.
            </p>
          </div>

          {/* Workflow Tabs */}
          <div className="flex justify-center gap-4 mb-16">
            {["landlord", "tenant", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveWorkflow(role)}
                className={`px-6 py-2 rounded-full border text-sm font-bold transition-all ${
                  activeWorkflow === role
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "bg-transparent border-slate-700 text-slate-400 hover:border-emerald-500 hover:text-white"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)} Flow
              </button>
            ))}
          </div>

          {/* Workflow Steps Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <AnimatePresence mode="wait">
              {workflows[activeWorkflow].map((step, index) => (
                <motion.div
                  key={`${activeWorkflow}-${index}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl h-full hover:border-emerald-500/50 transition-colors">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                      <step.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="absolute top-6 right-6 text-slate-600 font-mono text-xl font-bold opacity-20">
                      0{step.step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {/* Arrow Connector (Desktop only) */}
                  {index < workflows[activeWorkflow].length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ChevronRight className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (TEAM CARDS) --- */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wide mb-4">
              <GraduationCap size={14} /> Information Management Project
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Meet the Developers
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Havenly was brought to life by Group 10, a team dedicated to
              modernizing rental management solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:border-emerald-200 hover:shadow-xl transition-all group"
              >
                {/* Profile Image Container */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-slate-50 group-hover:border-emerald-50 transition-colors">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-sm text-emerald-600 font-medium mb-4">
                  {member.role}
                </p>

                {/* Social Placeholder Icons */}
                <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                    <Github size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Linkedin size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Code2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>

        <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Digitalize Your Rental Experience?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join the platform that connects landlords and tenants seamlessly.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/register"
              className="inline-flex items-center bg-white text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition-all"
            >
              Get Started Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;