import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Home,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

function TenantDashboard() {
  const leaseInfo = {
    property: "Sunset Apartments",
    room: "A-101",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    monthlyRent: 1200,
    status: "Active",
    address: "123 Main St, Cityville, ST 12345",
  };

  const payments = [
    {
      month: "November 2024",
      amount: 1200,
      date: "2024-11-01",
      status: "Paid",
    },
    {
      month: "October 2024",
      amount: 1200,
      date: "2024-10-01",
      status: "Paid",
    },
    {
      month: "September 2024",
      amount: 1200,
      date: "2024-09-01",
      status: "Paid",
    },
    {
      month: "August 2024",
      amount: 1200,
      date: "2024-08-01",
      status: "Paid",
    },
  ];

  const landlordInfo = {
    name: "John Doe",
    email: "john.doe@havenly.com",
    phone: "+1 (555) 123-4567",
    emergencyContact: "+1 (555) 987-6543",
  };

  const maintenanceRequests = [
    {
      id: 1,
      issue: "Kitchen sink leakage",
      date: "2024-11-15",
      status: "In Progress",
    },
    {
      id: 2,
      issue: "AC not working",
      date: "2024-10-30",
      status: "Completed",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Tenant Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Welcome to your rental dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-800 rounded-full">
            Lease Active
          </span>
          <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
            All Payments Current
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Lease Details */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Lease Details
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700">
              <FileText className="w-4 h-4" />
              View Full Lease
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Property</p>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-900">
                    {leaseInfo.property}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Room Number</p>
                <p className="text-lg font-semibold text-gray-900">
                  {leaseInfo.room}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">
                    ${leaseInfo.monthlyRent.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Lease Status</p>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800">
                  <CheckCircle2 className="w-4 h-4" />
                  {leaseInfo.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Start Date</p>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <p className="text-base text-gray-900">
                    {leaseInfo.startDate}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">End Date</p>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <p className="text-base text-gray-900">{leaseInfo.endDate}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Property Address</p>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <p className="text-base text-gray-900">{leaseInfo.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Landlord Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Landlord Contact
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {landlordInfo.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {landlordInfo.name}
                  </p>
                  <p className="text-sm text-gray-600">Property Owner</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a
                    href={`mailto:${landlordInfo.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {landlordInfo.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${landlordInfo.phone}`}
                    className="text-sm text-gray-900"
                  >
                    {landlordInfo.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-medium text-gray-900">Emergency Contact</h4>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-600" />
                <p className="text-sm text-gray-900">
                  {landlordInfo.emergencyContact}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                Send Message to Landlord
              </button>
              <button className="w-full py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors border border-gray-300">
                Request Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Payment History
          </h3>

          <div className="space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{payment.month}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    Paid on {payment.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ${payment.amount.toLocaleString()}
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3" />
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            View Payment Statements →
          </button>
        </div>

        {/* Maintenance Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Maintenance Requests
          </h3>

          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <div
                key={request.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900">{request.issue}</p>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === "Completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Submitted {request.date}
                  </p>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
            Submit New Request →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TenantDashboard;
