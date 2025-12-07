import {
  Banknote,
  Building2,
  MoreHorizontal,
  User,
  Wrench,
} from "lucide-react";

const RoomCard = ({ room, onClick, onAction }) => {
  // Helper: Status Colors using the "Tint" pattern
  const getStatusStyle = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20";
      case "Available":
        return "bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20";
      case "Maintenance":
        return "bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-400/50 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* --- Top Section: Identity & Status --- */}
      <div className="p-5 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1">
            <Building2 size={12} className="text-slate-400" />
            <span className="truncate max-w-[120px]">{room.property_name}</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
            {room.room_number}
          </h3>
        </div>

        {/* Status Badge */}
        <span
          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(
            room.room_status
          )}`}
        >
          {room.room_status}
        </span>
      </div>

      {/* --- Middle Section: Rent --- */}
      <div className="px-5 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <Banknote size={14} className="text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">
            ₱{room.monthly_rent.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">/mo</span>
        </div>
      </div>

      {/* --- Bottom Section: Tenant Info (The "Slot") --- */}
      <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-4 group-hover:bg-slate-50 transition-colors">
        {room.room_status === "Maintenance" ? (
          <div className="flex items-center gap-3 text-amber-600">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Wrench size={16} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">
              Under Maintenance
            </span>
          </div>
        ) : room.tenant ? (
          /* Occupied State */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                {getInitials(room.tenant.first_name, room.tenant.last_name)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">
                  {room.tenant.last_name}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Lease Active
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Vacant State */
          <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
              <User size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-500">Vacant</span>
              <span className="text-[10px] text-slate-400 font-medium">
                Ready for occupancy
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Action Menu Button (Floating) --- */}
      <div className="absolute top-4 right-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction && onAction("open_menu"); // Or handle menu opening logic
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default RoomCard;
