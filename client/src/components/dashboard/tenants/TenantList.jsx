import { ArrowRight, Calendar, Home } from "lucide-react";
import Badge from "../Badge"; // Adjust path as needed

// Helper logic (Same as before)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "emerald";
    case "expired":
      return "amber";
    case "terminated":
      return "rose";
    case "archived":
      return "slate";
    default:
      return "slate";
  }
};

const TenantListView = ({ tenants, onRowClick }) => {
  // Empty state check
  if (!tenants || tenants.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        No tenants found in this property.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          {/* --- Table Head --- */}
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Unit
              </th>
              <th className="hidden md:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Lease Period
              </th>
              <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
                Balance
              </th>
            </tr>
          </thead>

          {/* --- Table Body --- */}
          <tbody className="divide-y divide-slate-100">
            {tenants.map((tenant) => {
              const badgeColor = getBadgeColor(tenant.status);
              const balance = Number(tenant.balance || 0);

              return (
                <tr
                  key={tenant.tenant_id}
                  onClick={() => onRowClick && onRowClick(tenant)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  {/* 1. Tenant Column */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0 border border-slate-200">
                        {tenant.avatar_url ? (
                          <img
                            src={tenant.avatar_url}
                            alt={tenant.full_name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          tenant.full_name?.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      {/* Text Info */}
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {tenant.full_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {tenant.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Unit Column */}
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                      <Home size={12} className="text-slate-400" />
                      {tenant.current_room}
                    </div>
                  </td>

                  {/* 3. Lease Period Column (Hidden on mobile) */}
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(tenant.lease_start_date)}</span>
                      </div>
                      <ArrowRight size={12} className="text-slate-300" />
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        <span>{formatDate(tenant.lease_end_date)}</span>
                      </div>
                    </div>
                  </td>

                  {/* 4. Status Column */}
                  <td className="px-6 py-4">
                    <Badge color={badgeColor} variant="dot" size="sm">
                      {tenant.status}
                    </Badge>
                  </td>

                  {/* 5. Balance Column */}
                  <td
                    className={`px-6 py-4 text-right text-sm font-bold ${
                      balance > 0 ? "text-rose-600" : "text-slate-700"
                    }`}
                  >
                    {tenant.balance || `₱${balance.toLocaleString()}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantListView;
