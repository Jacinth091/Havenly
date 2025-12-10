import {
  Banknote,
  Calendar,
  Download,
  FileText,
  Home,
  MapPin,
  X,
} from "lucide-react";
import Badge from "../dashboard/Badge"; // Adjust path as needed

const LeaseDetailsModal = ({ isOpen, onClose, lease }) => {
  if (!isOpen || !lease) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Lease Details</h3>
            <p className="text-xs text-slate-500 font-mono">ID: #{lease.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Info Card */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Home size={28} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-slate-800 leading-tight">
                    {lease.property}
                  </h4>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                    <MapPin size={14} className="text-slate-400" />
                    <span>Unit {lease.unit}</span>
                  </div>
                </div>
                <Badge color={lease.status === "Expired" ? "slate" : "red"}>
                  {lease.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                <Calendar size={12} /> Duration
              </p>
              <div className="space-y-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">
                    Start
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {lease.start}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold mr-2">
                    End
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {lease.end}
                  </span>
                </div>
              </div>
            </div>

            {/* Rent */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
              <p className="text-xs font-bold text-emerald-600/70 uppercase mb-2 flex items-center gap-1.5">
                <Banknote size={12} /> Historical Rent
              </p>
              <p className="text-2xl font-bold text-emerald-700 tracking-tight">
                ₱{lease.monthly_rent?.toLocaleString() || "0"}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">
                Per month
              </p>
            </div>
          </div>

          {/* Footer / Actions */}
          <div className="pt-2">
            <button className="w-full py-2.5 px-4 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
              <Download size={16} /> Download Archived Contract
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <FileText size={12} /> This lease is no longer active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaseDetailsModal;
