import { Building2, MapPin, TrendingUp, Users, Wallet } from "lucide-react";
import Badge from "../Badge"; 

const PropertyInfoCard = ({ property, summary, rooms = [] }) => {
  if (!property) return null;

  // 1. CALCULATE MISSING FINANCIAL DATA
  // Since the API doesn't return totals, we sum them up from the rooms list
  const totalPotentialRent = rooms.reduce(
    (sum, room) => sum + (Number(room.monthly_rent) || 0),
    0
  );

  const currentMonthlyIncome = rooms.reduce((sum, room) => {
    return room.room_status === "Occupied"
      ? sum + (Number(room.monthly_rent) || 0)
      : sum;
  }, 0);

  const incomePercent =
    totalPotentialRent > 0
      ? (currentMonthlyIncome / totalPotentialRent) * 100
      : 0;

  // 2. SAFE ACCESS TO COUNTS
  // Use the summary object provided by the API
  const availableCount = summary?.Available || 0;
  const occupiedCount = summary?.Occupied || 0;
  const maintenanceCount = summary?.Maintenance || 0;
  const totalCount =
    property.total_rooms || availableCount + occupiedCount + maintenanceCount;

  // Calculate Occupancy Rate manually if missing
  const occupancyRate =
    totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0;

  const formatCurrency = (amount) =>
    `₱${amount?.toLocaleString(undefined, { minimumFractionDigits: 0 }) || 0}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 animate-fade-in group hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
            <Building2 size={24} />
          </div>
          {/* Default to Active if not provided, or check your specific logic */}
          <Badge
            color={property.is_active !== false ? "emerald" : "slate"}
            size="sm"
          >
            {property.is_active !== false ? "Active" : "Inactive"}
          </Badge>
        </div>

        <h3 className="font-bold text-2xl text-slate-800 tracking-tight mb-2">
          {property.name || property.property_name}
        </h3>

        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <MapPin size={16} className="shrink-0 text-slate-400" />
          <span className="truncate leading-relaxed">
            {property.full_address || `${property.address}, ${property.city}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/30">
        <div className="py-6 px-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Occupancy
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-2xl font-bold ${
                occupancyRate >= 80 ? "text-emerald-600" : "text-slate-800"
              }`}
            >
              {occupancyRate}%
            </span>
            {occupancyRate >= 80 && (
              <TrendingUp size={16} className="text-emerald-600" />
            )}
          </div>
        </div>

        <div className="py-6 px-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Tenants
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-slate-800">
              {/* If API doesn't give total tenants, assume 1 tenant per occupied room */}
              {property.total_tenants || occupiedCount}
            </span>
            <Users size={18} className="text-purple-600" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-grow">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Wallet size={18} className="text-emerald-600" />
            <span>Revenue Snapshot</span>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col mb-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Monthly Income
                </span>
                <span className="text-3xl font-bold text-slate-800 tracking-tight">
                  {formatCurrency(currentMonthlyIncome)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${incomePercent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                  <span>{incomePercent.toFixed(0)}% Captured</span>
                  <span>Target: {formatCurrency(totalPotentialRent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 size={18} className="text-blue-600" />
              <span>Unit Status</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {totalCount} Units
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                label: "Available",
                count: availableCount,
                color: "bg-blue-600",
              },
              {
                label: "Occupied",
                count: occupiedCount,
                color: "bg-emerald-600",
              },
              {
                label: "Maintenance",
                count: maintenanceCount,
                color: "bg-amber-600",
                hidden: maintenanceCount === 0,
              },
            ].map(
              (item) =>
                !item.hidden && (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm group/row"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${item.color} ring-2 ring-white shadow-sm`}
                      ></div>
                      <span className="text-slate-600 font-medium group-hover/row:text-slate-800 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800">
                      {item.count}
                    </span>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
