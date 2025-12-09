import { LayoutGrid, List } from "lucide-react";

/**
 * Reusable Tab Control
 * @param {Array} tabs - Array of objects: { id: string, label: string, count: number, color?: string }
 * @param {string} current - The ID of the currently selected tab
 * @param {function} onChange - Callback function when a tab is selected
 */
export const StatusControlTab = ({ tabs = [], current, onChange }) => {
  return (
    <div className="flex p-1 space-x-1 bg-slate-100/80 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = current === tab.id;

        // Dynamic Color Logic based on active state + optional tab color override
        // Default matches the 'Emerald' brand color defined in the project style
        const activeTextClass = tab.color
          ? `text-${tab.color}-700`
          : "text-emerald-700";

        const activeBgClass = tab.color
          ? `bg-${tab.color}-100`
          : "bg-emerald-100";

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
              ${
                isActive
                  ? "bg-white text-slate-800 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }
            `}
          >
            {tab.label}
            <span
              className={`
                px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-colors
                ${
                  isActive
                    ? `${activeBgClass} ${activeTextClass}`
                    : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                }
              `}
            >
              {tab.count}
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
