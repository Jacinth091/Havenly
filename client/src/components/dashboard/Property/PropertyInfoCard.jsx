import {
  Building2,
  Edit,
  MapPin,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Badge from "../Badge";

const PropertyInfoCard = ({ property }) => {
  if (!property) return null;

  const incomePercent =
    property.total_monthly_rent > 0
      ? (property.current_monthly_income / property.total_monthly_rent) * 100
      : 0;

  const formatCurrency = (amount) =>
    `₱${amount?.toLocaleString(undefined, { minimumFractionDigits: 0 }) || 0}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6 animate-fade-in group hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100">
            <Building2 size={24} />
          </div>
          <Badge color={property.is_active ? "emerald" : "slate"} size="sm">
            {property.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <h3 className="font-bold text-2xl text-slate-800 tracking-tight mb-2">
          {property.property_name}
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
                property.occupancy_rate >= 80
                  ? "text-emerald-600"
                  : "text-slate-800"
              }`}
            >
              {property.occupancy_rate}%
            </span>
            {property.occupancy_rate >= 80 && (
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
              {property.total_tenants || 0}
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
                  {formatCurrency(property.current_monthly_income)}
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
                  <span>
                    Target: {formatCurrency(property.total_monthly_rent)}
                  </span>
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
              {property.total_rooms} Units
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {[
              {
                label: "Available",
                count: property.available_rooms_count,
                color: "bg-blue-600",
              },
              {
                label: "Occupied",
                count: property.occupied_rooms_count,
                color: "bg-emerald-600",
              },
              {
                label: "Maintenance",
                count: property.maintenance_rooms_count,
                color: "bg-amber-600",
                hidden: property.maintenance_rooms_count === 0,
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
      <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:border-emerald-600 hover:text-emerald-700 hover:shadow-md transition-all">
          <Edit size={16} />
          <span>Manage Details</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyInfoCard;
