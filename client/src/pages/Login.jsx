import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Home,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { userLogin } from "../api/auth.api";
import { useAuth } from "../context/AuthProvider";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();

  const demoAccounts = [
    {
      role: "Administration",
      email: "admin@havenly.com",
      password: "password",
      icon: Shield,
      color: "bg-red-500",
    },
    {
      role: "Landlord",
      email: "landlord@havenly.com",
      password: "password",
      icon: Building2,
      color: "bg-blue-500",
    },
    {
      role: "Tenant",
      email: "tenant@havenly.com",
      password: "password",
      icon: Users,
      color: "bg-green-500",
    },
  ];

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    await login(demoEmail, demoPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Submitted");
    try {
      const formData = {
        email: email,
        password: password,
      };
      const response = await userLogin(formData);
      if (response !== false) {
        console.log("response", response);
      }
    } catch (error) {}
    // await login(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Havenly
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Your Digital Rental Haven
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-md mx-auto lg:mx-0">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Smart Living, <span className="text-blue-600">Simplified</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Streamline your rental experience with our comprehensive property
              management platform. From administration to tenant services,
              everything you need in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Property Management
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Tenant Portal</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Secure & Reliable
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-gray-700">
                Quick Access - Demo Accounts
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click any account to auto-fill credentials
              </p>
            </div>

            <div className="space-y-3">
              {demoAccounts.map((account, index) => {
                const IconComponent = account.icon;
                return (
                  <button
                    key={index}
                    onClick={() =>
                      handleDemoLogin(
                        account.email,
                        account.password,
                        account.role.toLowerCase()
                      )
                    }
                    disabled={isLoading}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`${account.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            {account.role}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Click to login
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {account.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Password: {account.password}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
