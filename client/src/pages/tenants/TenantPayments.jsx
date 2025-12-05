// Placeholder Icons - replacing lucide-react imports
const ArrowRight = (props) => (
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
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
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

// This component represents the main content for the Tenant Payments view.
const TenantPayments = () => {
  // Mock Payment Data - now including a reference number for receipts
  const payments = [
    {
      month: "December 2024",
      amount: "$1,200.00",
      status: "Upcoming",
      date: "Due 12-01",
      statusColor: "text-blue-600",
      bgColor: "bg-blue-50",
      ref: null,
    },
    {
      month: "November 2024",
      amount: "$1,200.00",
      status: "Completed",
      date: "2024-11-01",
      statusColor: "text-green-600",
      bgColor: "bg-green-50",
      ref: "TXN10245",
    },
    {
      month: "October 2024",
      amount: "$1,200.00",
      status: "Completed",
      date: "2024-10-01",
      statusColor: "text-green-600",
      bgColor: "bg-green-50",
      ref: "TXN10244",
    },
    {
      month: "September 2024",
      amount: "$1,200.00",
      status: "Completed",
      date: "2024-09-01",
      statusColor: "text-green-600",
      bgColor: "bg-green-50",
      ref: "TXN10243",
    },
    {
      month: "August 2024",
      amount: "$1,200.00",
      status: "Late",
      date: "2024-08-05",
      statusColor: "text-red-600",
      bgColor: "bg-red-50",
      ref: "TXN10242",
    },
    {
      month: "Security Deposit",
      amount: "$1,200.00",
      status: "Completed",
      date: "2024-06-01",
      statusColor: "text-purple-600",
      bgColor: "bg-purple-50",
      ref: "DEP10001",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
        Payment Center
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b pb-3">
          <h3 className="text-xl font-bold text-blue-600">
            Transaction History
          </h3>
          <button className="mt-3 sm:mt-0 bg-green-600 text-white py-2.5 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-md text-sm font-semibold flex items-center gap-1">
            Make a New Payment
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  For Month / Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 text-sm">
              {payments.map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                    {payment.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.bgColor} ${payment.statusColor}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.status === "Completed" ? (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        View Receipt
                      </button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="w-full mt-6 py-2.5 text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
          View Complete Financial Statement
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TenantPayments;
