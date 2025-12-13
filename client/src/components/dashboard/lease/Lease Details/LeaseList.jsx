import { MoreHorizontal } from "lucide-react";
import Badge from "../../Badge";
import CardMenu from "../../CardMenu";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(parseFloat(amount || 0));
};

const isExpiringSoon = (endDate) => {
  if (!endDate) return false;
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
};

// Updated to handle just the day number (e.g., 30)
const getOrdinal = (n) => {
  if (!n) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const getLeaseBadgeProps = (status, endDate) => {
  if (status === "Active" && isExpiringSoon(endDate)) {
    return { color: "amber", label: "Expiring Soon" };
  }
  switch (status) {
    case "Active":
      return { color: "emerald", label: "Active" };
    case "Expired":
      return { color: "red", label: "Expired" };
    default:
      return { color: "slate", label: status || "Unknown" };
  }
};
export const LeaseList = ({ data, getMenuOptions, onAction }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Tenant & Unit
              </th>
              <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Lease Period
              </th>
              <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
                Monthly Rent
              </th>
              <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((lease, index) => {
              // --- NEW JSON MAPPING ---
              const tenantName = lease.tenant || "Unknown Tenant";
              const propertyName = lease.property || "Unknown Property";
              const unitName = lease.unit || "N/A";
              const endDate = lease.end_date;
              const startDate = lease.start_date;
              const rent = formatCurrency(lease.monthly_rent);
              const dueDay = lease.payment_due_day;

              const badgeProps = getLeaseBadgeProps(lease.status, endDate);

              return (
                <tr
                  key={lease.id || index}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  {/* Column 1: Tenant + Property */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-sm shrink-0">
                        {tenantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {tenantName}
                        </div>
                        <div className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                          <span className="text-slate-700">{propertyName}</span>
                          <span className="text-slate-300">•</span>
                          Unit {unitName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: Date Range */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-900 font-medium flex items-center gap-2">
                        {endDate || "No End Date"}
                        {isExpiringSoon(endDate) &&
                          lease.status === "Active" && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                          )}
                      </span>
                      <span className="text-xs text-slate-400">
                        Started {startDate || "-"}
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Monthly Rent */}
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-base">
                      {rent}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">
                      Due: {getOrdinal(dueDay)} of month
                    </div>
                  </td>

                  {/* Column 4: Status */}
                  <td className="px-6 py-4 text-left">
                    <div className="inline-flex">
                      <Badge {...badgeProps}>{badgeProps.label}</Badge>
                    </div>
                  </td>

                  {/* Column 5: Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <CardMenu
                        options={getMenuOptions(lease)}
                        onAction={(actionId) => onAction(actionId, lease)}
                        trigger={
                          <button className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                            <MoreHorizontal size={18} />
                          </button>
                        }
                      />
                    </div>
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
