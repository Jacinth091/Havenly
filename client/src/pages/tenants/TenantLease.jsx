// Placeholder Icons - replacing lucide-react imports
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
const Download = (props) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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

const TenantLease = () => {
  const leaseInfo = {
    property: "Sunset Apartments",
    room: "A-101",
    startDate: "2024-06-01",
    endDate: "2025-05-31",
    monthlyRent: 1200,
    status: "Active",
    dueDay: 1,
    deposit: 1200,
    notes: "Tenant responsible for electricity and gas utilities.",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
        My Lease Agreement
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lease Overview and Details (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6 border-b pb-3">
            <h2 className="text-xl font-bold text-blue-600 flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Lease for Unit {leaseInfo.room}
            </h2>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-green-100 text-green-800">
              <CheckCircle2 className="w-4 h-4" />
              {leaseInfo.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                Financials
              </h3>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" /> Monthly
                  Rent:
                </span>
                <span className="text-xl font-bold text-green-600">
                  ${leaseInfo.monthlyRent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  Security Deposit:
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  ${leaseInfo.deposit.toLocaleString()} (Paid)
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 flex items-center gap-2">
                  Rent Due Date:
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  The {leaseInfo.dueDay}st of the month
                </span>
              </div>
            </div>

            {/* Term Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                Term Duration
              </h3>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" /> Start Date:
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {leaseInfo.startDate}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" /> End Date:
                </span>
                <span className="text-lg font-semibold text-red-600">
                  {leaseInfo.endDate}
                </span>
              </div>
              <div className="pt-2">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-base font-semibold">
                  <Download className="w-5 h-5" />
                  Download Signed Agreement
                </button>
              </div>
            </div>
          </div>

          {/* Lease Notes */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Important Lease Notes
            </h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
              {leaseInfo.notes}
            </div>
          </div>
        </div>

        {/* Renewal Card (1/3 width) */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Lease Renewal Status
          </h3>
          <p className="text-gray-600 mb-4">
            Your current lease expires in 7 months. We will notify you when the
            renewal window opens.
          </p>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-300 mb-4">
            <p className="font-semibold text-yellow-800">
              Renewal Eligibility:
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Eligible for renewal starting February 1, 2025.
            </p>
          </div>

          <button className="w-full py-3 text-sm font-semibold text-orange-600 border border-orange-300 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
            Inquire About Renewal
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantLease;
