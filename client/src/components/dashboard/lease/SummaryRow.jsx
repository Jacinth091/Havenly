export const SummaryRow = ({ label, value, isTotal = false }) => (
  <div
    className={`flex justify-between items-center py-2 ${
      isTotal
        ? "border-t border-slate-200 mt-2 pt-3"
        : "border-b border-slate-50"
    }`}
  >
    <span
      className={`text-sm ${
        isTotal ? "font-bold text-slate-800" : "text-slate-500"
      }`}
    >
      {label}
    </span>
    <span
      className={`text-sm ${
        isTotal
          ? "font-bold text-emerald-600 text-lg"
          : "font-medium text-slate-800"
      }`}
    >
      {value}
    </span>
  </div>
);
