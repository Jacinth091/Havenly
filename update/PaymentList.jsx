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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible animate-fade-in">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {/* Only show Tenant/Property if data exists (Hidden for Tenant Dashboard) */}
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

              {/* Core Columns */}
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
                <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                {/* 1. TENANT COLUMN (Optional) */}
                {showTenant && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">
                        {getInitials(payment.tenant)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {payment.tenant}
                        </div>
                      </div>
                    </div>
                  </td>
                )}

                {/* 2. PROPERTY COLUMN (Optional) */}
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

                {/* 3. AMOUNT */}
                {showAmount && (
                  <td className="px-6 py-4 font-bold text-slate-700">
                    ₱{payment.amount.toLocaleString()}
                  </td>
                )}

                {/* 4. METHOD */}
                {showMethod && (
                  <td className="hidden lg:table-cell px-6 py-4">
                    <PaymentMethodBadge method={payment.method} />
                  </td>
                )}

                {/* 5. DATE (Includes REF if Tenant column is hidden) */}
                {showDate && (
                  <td className="hidden md:table-cell px-6 py-4 text-slate-500">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {payment.date}
                      </div>
                      {/* If we aren't showing the tenant column, show the Ref # here to save space */}
                      {!showTenant && payment.ref && (
                        <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                          #{payment.ref}
                        </div>
                      )}
                    </div>
                  </td>
                )}

                {/* 6. STATUS */}
                {showStatus && (
                  <td className="px-6 py-4">
                    <Badge {...getBadgeProps(payment.status)} size="md">
                      {payment.status}
                    </Badge>
                  </td>
                )}

                {/* 7. ACTIONS */}
                {showActions && (
                  <td className="px-6 py-4 text-right">
                    <CardMenu
                      options={getMenuOptions(payment.status)}
                      onAction={(actionId) => onAction && onAction(actionId, payment)}
                    />
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
