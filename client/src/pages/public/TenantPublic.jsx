import { motion } from "framer-motion";
import { Bell, CreditCard, FileText, MessageSquare } from "lucide-react";

const TenantsPage = () => {
  const features = [
    {
      icon: FileText,
      title: "Lease Management",
      description: "Access your lease agreements anytime, anywhere.",
    },
    {
      icon: CreditCard,
      title: "Payment History",
      description: "View your payment history and download receipts.",
    },
    {
      icon: Bell,
      title: "Rent Reminders",
      description: "Get notified about upcoming rent payments.",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Message your landlord directly through the platform.",
    },
  ];

  // Fast animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
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
        duration: 0.3,
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
        duration: 0.25,
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
            For Tenants
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Simplify your rental experience with convenient tools designed for
            tenants.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={scaleIn}
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready for a Better Rental Experience?
          </h2>
          <p className="mb-6">Join our tenant community today.</p>
          <motion.a
            href="/register"
            className="inline-flex items-center bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Register as Tenant
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default TenantsPage;
