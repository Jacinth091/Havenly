import {
  Banknote,
  BedDouble,
  Building2,
  CheckCircle2,
  Wrench,
} from "lucide-react";

export const RoomSelectCard = ({ room, onClick, isSelected }) => {
  const status = room.room_status || "Available";

  const theme = {
    Occupied: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      badge: "bg-emerald-100 text-emerald-700",
    },
    Maintenance: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      badge: "bg-amber-100 text-amber-700",
    },
    Available: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      badge: "bg-blue-100 text-blue-700",
    },
  }[status] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    badge: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col justify-between
        bg-white rounded-xl p-4
        border transition-all duration-200 ease-out cursor-pointer group
        ${
          isSelected
            ? "border-emerald-500 ring-2 ring-emerald-500 shadow-md bg-emerald-50/30"
            : `border-slate-200 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1`
        }
      `}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-white rounded-full text-emerald-600 animate-in zoom-in duration-200 shadow-sm z-10">
          <CheckCircle2 size={24} className="fill-emerald-100" />
        </div>
      )}

      {/* --- Top Row: Icon & Rent --- */}
      <div className="flex justify-between items-start mb-3">
        {/* Left: Type Icon */}
        <div
          className={`w-9 h-9 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center transition-colors`}
        >
          {status === "Maintenance" ? (
            <Wrench size={18} />
          ) : (
            <BedDouble size={18} />
          )}
        </div>

        {/* Right: Rent Price */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Banknote size={10} />
            Rent
          </div>
          <p className="text-sm font-bold text-slate-700">
            ₱{Number(room.monthly_rent).toLocaleString()}
          </p>
        </div>
      </div>

      {/* --- Body: Unit Info --- */}
      <div className="grow">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {room.floor || "Unit"}
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${theme.badge}`}
          >
            {status}
          </span>
        </div>

        <h3
          className={`text-xl font-bold tracking-tight transition-colors ${
            isSelected
              ? "text-emerald-800"
              : "text-slate-800 group-hover:text-emerald-700"
          }`}
        >
          {room.room_number}
        </h3>

        {/* Property Name */}
        <div className="flex items-center gap-1.5 pt-1.5 text-slate-500">
          <Building2 size={12} className="shrink-0" />
          <span className="text-xs font-medium truncate max-w-[150px]">
            {room.property_name || "Property"}
          </span>
        </div>
      </div>
    </div>
  );
};
