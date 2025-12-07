import { LayoutGrid, List } from "lucide-react";

// components/dashboard/StatusSegmentedControl.jsx
export const StatusControlTab = ({ current, onChange, summary, total }) => {
  const statuses = ["All", "Available", "Occupied", "Maintenance"];

  return (
    <div className="flex p-1 space-x-1 bg-slate-100/80 rounded-lg border border-slate-200">
      {statuses.map((status) => {
        const isActive = current === status;
        const count = status === "All" ? total : summary?.[status] || 0;

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all
              ${
                isActive
                  ? "bg-white text-slate-800 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            {status}
            <span
              className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                }
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// Internal View Toggles Component
export const ViewToggles = ({ mode, setMode }) => (
  <div className="flex bg-slate-100/80 p-1 rounded-lg border border-slate-200 shrink-0 h-fit">
    <button
      onClick={() => setMode("list")}
      className={`p-1.5 rounded-md transition-all ${
        mode === "list"
          ? "bg-white shadow-sm text-emerald-600 ring-1 ring-black/5"
          : "text-slate-400 hover:text-slate-600"
      }`}
      title="List View"
    >
      <List size={16} />
    </button>
    <button
      onClick={() => setMode("card")}
      className={`p-1.5 rounded-md transition-all ${
        mode === "card"
          ? "bg-white shadow-sm text-emerald-600 ring-1 ring-black/5"
          : "text-slate-400 hover:text-slate-600"
      }`}
      title="Grid View"
    >
      <LayoutGrid size={16} />
    </button>
  </div>
);
