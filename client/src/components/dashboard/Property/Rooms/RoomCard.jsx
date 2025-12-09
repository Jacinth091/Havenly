import {
  Banknote,
  BedDouble,
  Building2,
  ExternalLink,
  User,
  Wrench,
} from "lucide-react";

const RoomCard = ({ room, onClick, onPropertyClick, menu }) => {
  // --- Theme Configuration ---
  const theme = {
    Occupied: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "hover:border-emerald-300",
      badge: "bg-emerald-100 text-emerald-700",
    },
    Maintenance: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "hover:border-amber-300",
      badge: "bg-amber-100 text-amber-700",
    },
    Available: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "hover:border-blue-300",
      badge: "bg-blue-100 text-blue-700",
    },
  }[room.room_status] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "hover:border-slate-300",
    badge: "bg-slate-100 text-slate-600",
  };

  const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col justify-between
        bg-white rounded-xl p-5
        border border-slate-200 
        shadow-sm hover:shadow-lg hover:-translate-y-1 ${theme.border}
        transition-all duration-300 ease-out cursor-pointer group
      `}
    >
      {/* --- Header --- */}
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center transition-colors`}
        >
          {room.room_status === "Maintenance" ? (
            <Wrench size={20} />
          ) : (
            <BedDouble size={20} />
          )}
        </div>
        <div className="relative z-20" onClick={(e) => e.stopPropagation()}>
          {menu}
        </div>
      </div>

      {/* --- Body --- */}
      <div className="mb-6 grow space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Unit
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${theme.badge}`}
          >
            {room.room_status}
          </span>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
          {room.room_number}
        </h3>

        {/* --- CONDITIONAL PROPERTY LINK --- */}
        {/* Only render this div if onPropertyClick is provided */}
        {onPropertyClick && (
          <div
            role="button"
            tabIndex={0}
            title={`Go to ${room.property_name}`}
            onClick={(e) => {
              e.stopPropagation();
              onPropertyClick(room.property_id);
            }}
            className="
              relative z-10 w-fit flex items-center gap-1.5 pt-1.5 
              text-slate-500 hover:text-emerald-600 
              transition-colors group/link cursor-pointer
            "
          >
            <Building2 size={14} className="shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[150px] group-hover/link:underline underline-offset-2">
              {room.property_name}
            </span>
            <ExternalLink
              size={12}
              className="opacity-50 group-hover/link:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {room.tenant ? (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm">
                {getInitials(room.tenant.first_name, room.tenant.last_name)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700 truncate max-w-[80px]">
                  {room.tenant.last_name}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">
                  Active
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center">
                <User size={14} />
              </div>
              <span className="text-xs font-medium text-slate-400 italic">
                Vacant
              </span>
            </>
          )}
        </div>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Banknote size={10} />
            Rent
          </div>
          <p className="text-sm font-bold text-slate-700">
            ₱{room.monthly_rent.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
