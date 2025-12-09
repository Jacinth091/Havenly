import { Building2, User } from "lucide-react";
import Badge from "./Badge"; // Adjust path as needed

const ListItem = ({ room, menu, onClick, getInitials }) => {
  const statusTheme =
    {
      Occupied: "hover:bg-emerald-50/50",
      Maintenance: "hover:bg-amber-50/50",
      Available: "hover:bg-blue-50/50",
    }[room.room_status] || "hover:bg-slate-50";

  return (
    <tr
      onClick={onClick}
      className={`group transition-colors duration-200 cursor-pointer border-b border-slate-100 last:border-0 ${statusTheme}`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">
              {room.room_number}
            </span>
            <span className="text-xs text-slate-500 md:hidden">
              {room.property_name}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden sm:table-cell px-6 py-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 size={14} className="text-slate-400" />
          <span className="text-sm font-medium">{room.property_name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <Badge
          size="sm"
          color={
            room.room_status === "Occupied"
              ? "emerald"
              : room.room_status === "Available"
              ? "blue"
              : "amber"
          }
        >
          {room.room_status}
        </Badge>
      </td>
      <td className="px-6 py-4">
        {room.tenant ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
              {getInitials(room.tenant.first_name, room.tenant.last_name)}
            </div>
            <span className="text-sm text-slate-700 font-medium">
              {room.tenant.last_name}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={12} className="text-slate-500" />
            </div>
            <span className="text-xs italic text-slate-400">Empty</span>
          </div>
        )}
      </td>
      <td className="hidden md:table-cell px-6 py-4">
        <span className="text-sm font-bold text-slate-600">
          ₱{room.monthly_rent.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end">{menu}</div>
      </td>
    </tr>
  );
};

export default ListItem;
