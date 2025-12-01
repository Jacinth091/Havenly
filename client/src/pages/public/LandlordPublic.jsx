import { motion } from "framer-motion";
import { BarChart, Building2, CreditCard, Users } from "lucide-react";

const LandlordsPage = () => {
  const benefits = [
    {
      icon: Building2,
      title: "Property Portfolio",
      description: "Manage all your properties in one centralized dashboard.",
    },
    {
      icon: Users,
      title: "Tenant Management",
      description:
        "Track tenant information, lease agreements, and communication.",
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description: "Monitor rent payments and generate financial reports.",
    },
    {
      icon: BarChart,
      title: "Analytics & Reports",
      description: "Gain insights into your rental business performance.",
    },
  ];

  // FASTER animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Faster stagger
        delayChildren: 0.1, // Shorter delay
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25, // Faster duration
        ease: "easeOut",
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3, // Faster
        ease: "easeOut",
      },
    },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.25, // Faster
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            For Landlords
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Streamline your property management with tools designed specifically
            for landlords.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.15 } }} // Faster hover
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={scaleIn}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Simplify Your Rental Management?
          </h2>
          <p className="mb-6">Join thousands of landlords using Havenly.</p>
          <motion.a
            href="/register"
            className="inline-flex items-center bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started as Landlord
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandlordsPage;
