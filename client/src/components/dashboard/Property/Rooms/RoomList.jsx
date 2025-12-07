import { Banknote, Building2, MoreHorizontal, User } from "lucide-react";

const RoomList = ({ room, onClick, onAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied":
        return "bg-emerald-100 text-emerald-700";
      case "Available":
        return "bg-blue-100 text-blue-700";
      case "Maintenance":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`;

  return (
    <tr
      onClick={onClick}
      className="group hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50 last:border-none"
    >
      {/* 1. Room Identity */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-base">
            {room.room_number}
          </span>
          {/* Mobile-only subtext could go here */}
        </div>
      </td>

      {/* 2. Property Context */}
      <td className="hidden sm:table-cell px-6 py-4">
        <div className="flex items-center gap-2 text-slate-500">
          <div className="p-1.5 bg-slate-100 rounded text-slate-400">
            <Building2 size={14} />
          </div>
          <span className="text-sm font-medium">{room.property_name}</span>
        </div>
      </td>

      {/* 3. Status */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(
            room.room_status
          )}`}
        >
          {room.room_status === "Occupied" && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          )}
          {room.room_status === "Available" && (
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
          )}
          {room.room_status === "Maintenance" && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          )}
          {room.room_status}
        </span>
      </td>

      {/* 4. Tenant Info */}
      <td className="px-6 py-4">
        {room.tenant ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
              {getInitials(room.tenant.first_name, room.tenant.last_name)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                {room.tenant.first_name} {room.tenant.last_name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 opacity-70">
            <User size={16} />
            <span className="text-xs italic">Vacant</span>
          </div>
        )}
      </td>

      {/* 5. Financials */}
      <td className="hidden md:table-cell px-6 py-4">
        <div className="flex items-center gap-1 text-slate-600">
          <Banknote size={14} className="text-slate-400" />
          <span className="font-semibold">
            ₱{room.monthly_rent.toLocaleString()}
          </span>
        </div>
      </td>

      {/* 6. Actions */}
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction && onAction("open_menu");
          }}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
};

export default RoomList;
