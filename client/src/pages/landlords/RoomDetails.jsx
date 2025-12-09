import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  History,
  Home,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Shield,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRoomDetails } from "../../api/room.api";

const RoomDetails = () => {
  const navigate = useNavigate();
  const { propertyId, roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getRoomDetails(propertyId, roomId);

      if (result.success) {
        setRoom(result.data);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };

    fetchData();
  }, [propertyId, roomId]);

  const getStatusBadge = (status) => {
    const styles = {
      Occupied: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Maintenance: "bg-amber-100 text-amber-700 border-amber-200",
      Available: "bg-blue-100 text-blue-700 border-blue-200",
    };
    const icons = {
      Occupied: <CheckCircle2 size={12} />,
      Maintenance: <Wrench size={12} />,
      Available: <Home size={12} />,
    };

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
          styles[status] || styles.Available
        }`}
      >
        {icons[status]} {status}
      </span>
    );
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-emerald-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    );
  }
  if (error || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <AlertCircle size={48} className="mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-slate-700">
          Unable to load room
        </h2>
        <p className="mb-6">{error || "Room not found"}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50"
        >
          Go Back
        </button>
      </div>
    );
  }
  const lease = room.current_lease;
  const tenant = lease?.tenant;
  const property = room.property;
  const transactions = room.transactions || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">
                Room {room.room_number}
              </h2>
              {getStatusBadge(room.room_status)}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {property.name} •{" "}
              <span className="text-slate-500">{property.address}</span>
            </p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">
            <Edit size={16} /> Edit
          </button>
          {/* Only show 'Record Payment' if there is an active lease */}
          {lease && (
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm transition-all">
              <Banknote size={16} /> Record Payment
            </button>
          )}
        </div>
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Banknote size={20} />}
          color="emerald"
          label="Monthly Rent"
          // Show Lease Rent if occupied, otherwise show default Room Rent
          value={`₱${(
            lease?.monthly_rent || room.monthly_rent
          ).toLocaleString()}`}
          subtext={lease ? "Current Lease Rate" : "Standard Room Rate"}
        />
        <StatCard
          icon={<Shield size={20} />}
          color="blue"
          label="Security Deposit"
          value={`₱${(lease?.security_deposit || 0).toLocaleString()}`}
          subtext={lease ? "Held in Escrow" : "Not applicable"}
        />
        <StatCard
          icon={<Clock size={20} />}
          color="amber"
          label="Next Payment Due"
          value={lease ? `Day ${lease.payment_due_day}` : "-"}
          subtext={lease ? "Of every month" : "No active lease"}
        />
        <StatCard
          icon={<Calendar size={20} />}
          color="slate"
          label="Lease Ends"
          value={lease ? new Date(lease.end_date).toLocaleDateString() : "-"}
          subtext={lease ? `${lease.lease_status} Contract` : "Vacant"}
        />
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* TABS CONTAINER */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            {/* Tab Header */}
            <div className="flex border-b border-slate-200 px-6">
              <button
                onClick={() => setActiveTab("transactions")}
                className={`py-4 mr-8 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "transactions"
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <History size={16} /> Transactions
              </button>
              <button
                onClick={() => setActiveTab("lease")}
                className={`py-4 mr-8 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === "lease"
                    ? "border-emerald-500 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <FileText size={16} /> Lease Details
              </button>
            </div>

            {/* TAB CONTENT: TRANSACTIONS */}
            {activeTab === "transactions" && (
              <div className="p-0">
                {transactions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-4 font-semibold whitespace-nowrap">
                              Date
                            </th>
                            <th className="px-6 py-4 font-semibold whitespace-nowrap">
                              Month
                            </th>
                            <th className="px-6 py-4 font-semibold whitespace-nowrap">
                              Details
                            </th>
                            <th className="px-6 py-4 font-semibold whitespace-nowrap">
                              Amount
                            </th>
                            <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {transactions.map((txn) => (
                            <tr
                              key={txn.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                {new Date(txn.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                                {txn.for_month}
                              </td>
                              <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-medium text-slate-700">
                                    {txn.method}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">
                                    Ref: {txn.ref}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
                                ₱{txn.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {txn.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 border-t border-slate-100 text-center">
                      <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                        View Full History
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-10 text-center text-slate-400">
                    <History size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No transactions found for this lease.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LEASE */}
            {activeTab === "lease" && (
              <div className="p-8">
                {lease ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    <InfoGroup label="Agreement Status">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold">
                        <CheckCircle2 size={14} /> {lease.lease_status}
                      </span>
                    </InfoGroup>

                    <InfoGroup label="Duration">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Calendar size={18} className="text-slate-400" />
                        <span className="font-medium">
                          {new Date(lease.start_date).toLocaleDateString()} —{" "}
                          {new Date(lease.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </InfoGroup>

                    <InfoGroup label="Payment Terms">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Clock size={18} className="text-slate-400" />
                        <span>
                          Due on the{" "}
                          <strong className="text-slate-900">
                            {lease.payment_due_day}th
                          </strong>{" "}
                          of the month
                        </span>
                      </div>
                    </InfoGroup>

                    <InfoGroup label="Security Deposit">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Shield size={18} className="text-slate-400" />
                        <span className="font-medium">
                          ₱{lease.security_deposit.toLocaleString()}
                        </span>
                      </div>
                    </InfoGroup>

                    <div className="col-span-1 md:col-span-2 pt-6 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Notes
                      </h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 italic">
                        "{lease.notes || "No notes available."}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <FileText size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No active lease for this room.</p>
                    <button className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                      Create New Lease
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="space-y-6">
          {/* TENANT PROFILE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Current Tenant
                </h3>
                {tenant && (
                  <p className="text-xs text-slate-500">
                    Occupant ID #{tenant.tenant_id}
                  </p>
                )}
              </div>
              <button className="text-slate-400 hover:text-purple-600 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>

            <div className="p-6">
              {tenant ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl font-bold ring-4 ring-white shadow-sm">
                      {tenant.first_name[0]}
                      {tenant.last_name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">
                        {tenant.first_name} {tenant.last_name}
                      </h4>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Active Lease
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ContactRow
                      icon={<Phone size={16} />}
                      text={tenant.contact_num || "N/A"}
                    />
                    <ContactRow
                      icon={<Mail size={16} />}
                      text={tenant.email || "N/A"}
                    />
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <button className="w-full py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-sm font-medium hover:bg-purple-100 hover:border-purple-200 transition-all flex items-center justify-center gap-2">
                      <User size={16} /> View Full Profile
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-slate-400">
                  <User size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tenant assigned.</p>
                </div>
              )}
            </div>
          </div>

          {/* MAINTENANCE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Wrench size={18} className="text-slate-400" /> Maintenance
              </h3>
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                0 Active
              </span>
            </div>

            <div className="text-center py-6 bg-slate-50/50 rounded-lg border border-dashed border-slate-200 mb-4">
              <p className="text-sm text-slate-400 italic">No open tickets</p>
            </div>

            <button className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all">
              Report Issue
            </button>
          </div>

          {/* LEASE ACTIONS (Only show if lease exists) */}
          {lease && (
            <div className="bg-red-50/50 rounded-xl border border-red-100 p-6">
              <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle size={16} /> End Tenancy
              </h4>
              <p className="text-xs text-red-600/70 mb-4">
                Terminate lease early or mark as moved out.
              </p>
              <button className="text-xs font-bold text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3 py-2 rounded shadow-sm w-full">
                Manage Lease Termination
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtext, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
};

const ContactRow = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-sm group cursor-pointer p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors">
    <div className="text-slate-400 group-hover:text-purple-600 transition-colors">
      {icon}
    </div>
    <span className="text-slate-600 font-medium">{text}</span>
  </div>
);

const InfoGroup = ({ label, children }) => (
  <div>
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
      {label}
    </h4>
    {children}
  </div>
);

export default RoomDetails;
