import { motion } from "framer-motion";
import {
  Building2,
  CheckCircle,
  CreditCard,
  Database,
  Shield,
  Users,
} from "lucide-react";

const FeaturesPage = () => {
  const features = [
    {
      icon: Building2,
      title: "Property Management",
      description:
        "Manage multiple properties, track rooms, and handle all rental operations in one platform.",
      details: [
        "Add/Edit Properties",
        "Room Management",
        "Property Status Tracking",
      ],
    },
    {
      icon: Users,
      title: "Tenant Management",
      description:
        "Streamline tenant registration, profile management, and communication.",
      details: ["Tenant Profiles", "Contact Management", "Communication Logs"],
    },
    {
      icon: CreditCard,
      title: "Payment Tracking",
      description:
        "Record and monitor rent payments with detailed transaction history.",
      details: [
        "Payment Recording",
        "Transaction History",
        "Receipt Generation",
      ],
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description:
        "Secure system with distinct access levels for different user types.",
      details: ["Admin Controls", "Landlord Dashboard", "Tenant Portal"],
    },
    {
      icon: Database,
      title: "Local Database",
      description:
        "Built with MySQL and XAMPP for secure, reliable data management.",
      details: [
        "MySQL Database",
        "XAMPP Integration",
        "Local Network Security",
      ],
    },
  ];

  // Fast animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07, // Faster than others for more items
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
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

  const listItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
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
            Powerful Features
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover all the tools you need to efficiently manage your rental
            properties and tenants.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.15 } }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 + 0.1 }}
                className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4"
              >
                <feature.icon className="w-6 h-6 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <motion.ul variants={containerVariants} className="space-y-2">
                {feature.details.map((detail, idx) => (
                  <motion.li
                    key={idx}
                    variants={listItemVariants}
                    className="flex items-center text-sm text-gray-600"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {detail}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeaturesPage;
