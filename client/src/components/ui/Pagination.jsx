import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Pagination = ({
  currentPage,
  totalItems,
  limit, // New Prop: items per page
  onPageChange,
  onLimitChange, // New Prop: function to update limit
  className = "",
}) => {
  // Calculate total pages dynamically
  const totalPages = Math.ceil(totalItems / limit);

  // Calculate "Showing X to Y of Z"
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Page Number Logic
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push("...");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  if (totalItems < 1) return null;

  // Style Classes
  const btnBase =
    "flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-xs font-bold transition-all border outline-none focus:ring-2 focus:ring-emerald-500/20";
  const btnDefault =
    "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200";
  const btnActive =
    "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-200";
  const btnDisabled =
    "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed";

  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 w-full ${className}`}
    >
      {/* LEFT: Context Text & Limit Selector */}
      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 font-medium">
        <span>
          Showing{" "}
          <span className="font-bold text-slate-800">
            {startItem}-{endItem}
          </span>{" "}
          of <span className="font-bold text-slate-800">{totalItems}</span>
        </span>

        {/* Limit Selector */}
        {onLimitChange && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 pl-2 pr-1.5 py-1 bg-white border border-slate-200 rounded-md hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              <span className="font-bold text-slate-700">{limit}</span> / page
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-24 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
                {[9, 18, 27, 45].map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      onLimitChange(size);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 hover:text-emerald-600 ${
                      limit === size
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-slate-600"
                    }`}
                  >
                    Show {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Page Navigation */}
      <div className="flex items-center justify-center gap-1.5">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${
            currentPage === 1 ? btnDisabled : btnDefault
          }`}
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${btnBase} ${
            currentPage === 1 ? btnDisabled : btnDefault
          }`}
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`dots-${i}`}
                className="w-8 flex justify-center text-slate-300"
              >
                <MoreHorizontal size={14} />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${btnBase} ${
                  currentPage === page ? btnActive : btnDefault
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${
            currentPage === totalPages ? btnDisabled : btnDefault
          }`}
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${btnBase} ${
            currentPage === totalPages ? btnDisabled : btnDefault
          }`}
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
