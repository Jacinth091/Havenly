// Placeholder Icons - replacing lucide-react imports for single-file environment
const AlertCircle = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const Calendar = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const CheckCircle2 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 11.85L12 15.85L16 9.85" />
  </svg>
);
const Clock = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const DollarSign = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const FileText = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);
const Home = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const Mail = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const MapPin = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const Phone = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-7.07-7.07A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4.1 2h3.62a2 2 0 0 1 1.95 1.77l.8 6a2 2 0 0 1-.45 1.76L8.1 14.5a15 15 0 0 0 7.4 7.4l2.25-1.93a2 2 0 0 1 1.76-.45l6 .8c.9.15 1.77.72 1.77 1.63z" />
  </svg>
);

const TenantDashboard = () => {
  // Data structures provided by the user, adapted for use in the component
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
      month: "December 2024",
      amount: 1200,
      date: "Due Dec 1st",
      status: "Upcoming",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      icon: Clock,
    },
    {
      month: "November 2024",
      amount: 1200,
      date: "2024-11-01",
      status: "Paid",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: CheckCircle2,
    },
    {
      month: "October 2024",
      amount: 1200,
      date: "2024-10-01",
      status: "Paid",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: CheckCircle2,
    },
    {
      month: "September 2024",
      amount: 1200,
      date: "2024-09-01",
      status: "Paid",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      icon: CheckCircle2,
    },
  ];

  const landlordInfo = {
    name: "John Doe",
    email: "john.doe@havenly.com",
    phone: "+1 (555) 123-4567",
    emergencyContact: "+1 (555) 987-6543",
  };

  // Removed maintenanceRequests data as it is not supported by the underlying DB structure

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Tenant Dashboard
            </h1>
            <p className="text-base text-gray-600 mt-1">
              Welcome to your digital rental haven. Quick access to your lease
              and payment information.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              Lease Active
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 shadow-sm">
              <DollarSign className="w-4 h-4" />
              Payments Current
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lease Details (Span 2 columns on large screens) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Lease Details: {leaseInfo.property}
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                View Full Lease
              </button>
            </div>

            <div className="space-y-6">
              {/* Property Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Property</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {leaseInfo.property}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Unit</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {leaseInfo.room}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Monthly Rent</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${leaseInfo.monthlyRent.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Lease Status</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4" />
                    {leaseInfo.status}
                  </span>
                </div>
              </div>

              {/* Dates and Address Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {leaseInfo.startDate}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> End Date
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {leaseInfo.endDate}
                  </p>
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-1">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Address
                  </p>
                  <p className="text-base font-medium text-gray-900">
                    {leaseInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Landlord Contact */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3">
              Landlord Contact
            </h3>

            <div className="space-y-6">
              {/* Landlord Profile */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-blue-300">
                    {landlordInfo.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-gray-900">
                      {landlordInfo.name}
                    </p>
                    <p className="text-sm text-blue-600">Property Manager</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <a
                      href={`mailto:${landlordInfo.email}`}
                      className="text-sm text-blue-600 hover:underline transition-colors"
                    >
                      {landlordInfo.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-500" />
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
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h4 className="font-bold text-red-700">Emergency Line</h4>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-gray-900 font-semibold">
                    {landlordInfo.emergencyContact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History - Now spans full width below the top row */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View Full Statements →
            </button>
          </div>

          <div className="space-y-4">
            {payments.map((payment, index) => {
              const Icon = payment.icon;
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg transition-all duration-200 hover:bg-gray-50 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${payment.bgColor}`}>
                      <Icon className={`w-5 h-5 ${payment.textColor}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {payment.month}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {payment.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${payment.textColor}`}>
                      ${payment.amount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${payment.bgColor} ${payment.textColor}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;
