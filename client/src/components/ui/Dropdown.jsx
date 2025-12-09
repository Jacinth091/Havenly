import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FilterDropdown = ({
  options = [],
  value,
  onChange,
  label = "Select",
  icon: Icon, // Rename prop to capitalize for usage as component
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2 
          bg-white border rounded-lg text-sm transition-all duration-200
          ${
            isOpen
              ? "border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }
        `}
      >
        <div className="flex items-center gap-2 text-slate-600 truncate">
          {Icon && (
            <Icon
              size={16}
              className={isOpen ? "text-emerald-500" : "text-slate-400"}
            />
          )}
          <span
            className={value ? "text-slate-800 font-medium" : "text-slate-500"}
          >
            {value || label}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-500" : ""
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 w-full min-w-[180px] bg-white border border-slate-100 rounded-lg shadow-xl animate-fade-in-up overflow-hidden">
          <ul className="max-h-60 overflow-y-auto py-1">
            {/* 'All' Option */}
            <li
              onClick={() => handleSelect("All")}
              className={`
                px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between group
                ${
                  value === "All" || value === ""
                    ? "bg-emerald-50 text-emerald-700 font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <span>All Cities</span>
              {(value === "All" || value === "") && <Check size={14} />}
            </li>

            {/* Divider */}
            {options.length > 0 && <div className="h-px bg-slate-100 my-1" />}

            {/* Dynamic Options */}
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className={`
                  px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between
                  ${
                    value === option
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <span className="truncate">{option}</span>
                {value === option && <Check size={14} />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
