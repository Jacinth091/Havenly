import { Building } from "lucide-react";
import Badge from "./Badge";

const RoomListItem = ({ room, getInitials, onClick, menu }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Occupied":
        return "emerald";
      case "Maintenance":
        return "amber";
      case "Available":
        return "blue";
      default:
        return "slate";
    }
  };

  return (
    <tr
      onClick={onClick}
      className="group border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <span className="text-sm font-bold text-slate-900">
          {room.room_number}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        <div className="flex items-center gap-3">
          <div className="text-slate-400">
            <Building size={18} />
          </div>
          <Badge color={getStatusColor(room.room_status)} size="sm">
            {room.room_status === "Occupied" && <span className="mr-1">✓</span>}
            {room.room_status}
          </Badge>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap align-middle">
        {room.tenant ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {getInitials(room.tenant.first_name, room.tenant.last_name)}
            </div>
            <span className="text-sm font-medium text-slate-800">
              {room.tenant.last_name}, {room.tenant.first_name}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-400 italic pl-1">Vacant</span>
        )}
      </td>
      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap align-middle">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Per Month
          </span>
          <span className="text-sm font-bold text-slate-700">
            ₱{room.monthly_rent.toLocaleString()}
          </span>
        </div>
      </td>
      <td
        className="px-6 py-4 whitespace-nowrap text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          {menu}
        </div>
      </td>
    </tr>
  );
};

export default RoomListItem;
