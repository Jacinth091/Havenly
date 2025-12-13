import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import Badge from "../../Badge";
import CardMenu from "../../CardMenu";
import PaymentMethodBadge from "../../PaymentBadge";

const PaymentsList = ({ data, getInitials, getMenuOptions, onAction }) => {
  // 1. Inspect data to determine which columns to show
  const sample = data && data.length > 0 ? data[0] : {};

  const showTenant = "tenant" in sample;
  const showProperty = "property" in sample;
  const showAmount = "amount" in sample;
  const showMethod = "method" in sample;
  const showDate = "date" in sample;
  const showStatus = "status" in sample;
  const showActions = !!getMenuOptions;

  const getBadgeProps = (status) => {
    switch (status) {
      case "Verified":
      case "Completed":
        return { color: "emerald", icon: CheckCircle2 };
      case "Pending":
        return { color: "amber", icon: Clock };
      case "Overdue":
      case "Rejected":
      case "Cancelled":
        return { color: "red", icon: AlertCircle };
      default:
        return { color: "slate" };
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500">
        No payment data available.
      </div>
    );
  }

  return (
    // FIX: Removed overflow-hidden from the outer container to let menus pop out if needed,
    // OR use 'overflow-visible' if the table doesn't need horizontal scrolling.
    // If horizontal scroll is needed, the menu MUST be a Portal (React Portal).
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      {/* If you need horizontal scroll, this div must have overflow-x-auto.
         This causes the clipping. 
         If you don't expect the table to overflow, remove 'overflow-x-auto'.
         Otherwise, verify CardMenu uses a Portal (like Headless UI Menu).
      */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {showTenant && (
                <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Tenant
                </th>
              )}
              {showProperty && (
                <th className="hidden sm:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Property
                </th>
              )}
              {showAmount && (
                <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Amount
                </th>
              )}
              {showMethod && (
                <th className="hidden lg:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Method
                </th>
              )}
              {showDate && (
                <th className="hidden md:table-cell px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Date
                </th>
              )}
              {showStatus && (
                <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">
                  Status
                </th>
              )}
              {showActions && (
                <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right w-10">
                  {/* Empty header for actions */}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-slate-50 transition-colors group relative"
              >
                {showTenant && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                        {getInitials
                          ? getInitials(payment.tenant)
                          : payment.tenant.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {payment.tenant}
                        </div>
                      </div>
                    </div>
                  </td>
                )}

                {showProperty && (
                  <td className="hidden sm:table-cell px-6 py-4 text-slate-600">
                    <div className="font-medium">{payment.property}</div>
                    {payment.unit && (
                      <div className="text-xs text-slate-400">
                        Unit {payment.unit}
                      </div>
                    )}
                  </td>
                )}

                {showAmount && (
                  <td className="px-6 py-4 font-bold text-slate-700">
                    ₱{Number(payment.amount).toLocaleString()}
                  </td>
                )}

                {showMethod && (
                  <td className="hidden lg:table-cell px-6 py-4">
                    <PaymentMethodBadge method={payment.method} />
                  </td>
                )}

                {showDate && (
                  <td className="hidden md:table-cell px-6 py-4 text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {payment.date}
                      </div>
                      {!showTenant && payment.ref && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                          #{payment.ref}
                        </div>
                      )}
                    </div>
                  </td>
                )}

                {showStatus && (
                  <td className="px-6 py-4">
                    <Badge {...getBadgeProps(payment.status)} size="md">
                      {payment.status}
                    </Badge>
                  </td>
                )}

                {showActions && (
                  <td className="px-6 py-4 text-right">
                    {/* FIX: 
                        1. We pass `align="right"` to CardMenu if supported.
                        2. We ensure the container allows the dropdown to be visible.
                    */}
                    <div className="flex justify-end">
                      <CardMenu
                        options={getMenuOptions(payment)}
                        onAction={(actionId) =>
                          onAction && onAction(actionId, payment)
                        }
                      />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsList;
