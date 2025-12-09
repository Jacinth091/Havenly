import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
const CardMenu = ({ options, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!options || options.length === 0) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-1 rounded-md transition-colors ${
          isOpen
            ? "bg-slate-100 text-slate-600"
            : "text-slate-300 hover:text-slate-600"
        }`}
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden animate-fade-in-down origin-top-right">
          <div className="py-1">
            {options.map((option, index) => {
              if (option.type === "divider") {
                return (
                  <div key={index} className="border-t border-slate-100 my-1" />
                );
              }
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onAction(option.id);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                    option.className || "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default CardMenu;
