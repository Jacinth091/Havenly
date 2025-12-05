// Placeholder Icons - replacing lucide-react imports
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
const MessageSquare = (props) => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const Plus = (props) => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const List = (props) => (
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
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const RequestItem = ({ request }) => {
  let statusClass = "bg-gray-100 text-gray-800";
  let statusBorder = "border-gray-300";

  if (request.status === "In Progress") {
    statusClass = "bg-yellow-100 text-yellow-800";
    statusBorder = "border-yellow-300";
  } else if (request.status === "Completed") {
    statusClass = "bg-green-100 text-green-800";
    statusBorder = "border-green-300";
  }

  return (
    <div
      className={`p-4 border ${statusBorder} rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="mb-2 sm:mb-0">
        <p className="font-semibold text-gray-900 text-base">{request.issue}</p>
        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" />
          Submitted: {request.date}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
        >
          {request.status}
        </span>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View Details
        </button>
      </div>
    </div>
  );
};

const TenantRequests = () => {
  const maintenanceRequests = [
    {
      id: 3,
      issue: "Clogged toilet in main bath",
      date: "2024-11-20",
      status: "Pending",
    },
    {
      id: 1,
      issue: "Kitchen sink leakage",
      date: "2024-11-15",
      status: "In Progress",
    },
    { id: 2, issue: "AC not working", date: "2024-10-30", status: "Completed" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
        Maintenance Requests
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Request Card (1/3 width) */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border-t-4 border-blue-600 border-gray-200 p-6 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            New Request
          </h2>
          <p className="text-gray-600 mb-4">
            Need help with a repair? Submit a new maintenance ticket here.
          </p>

          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-md text-base font-semibold">
            <Plus className="w-5 h-5" />
            Submit New Request
          </button>
        </div>

        {/* Request History (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <List className="w-6 h-6 text-blue-600" />
            Request History (
            {
              maintenanceRequests.filter((r) => r.status !== "Completed").length
            }{" "}
            Open)
          </h2>

          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <RequestItem key={request.id} request={request} />
            ))}
          </div>

          <button className="w-full mt-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-300 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            Load Older Requests
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantRequests;
