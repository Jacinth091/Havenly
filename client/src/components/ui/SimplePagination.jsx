import { ChevronLeft, ChevronRight } from "lucide-react";

export const PaginationControls = ({
  page,
  totalPages,
  setPage,
  isLoading,
}) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
      <button
        disabled={page === 1 || isLoading}
        onClick={() => setPage(Math.max(1, page - 1))}
        className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 active:bg-slate-100 rounded-lg transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <span className="text-xs font-bold text-slate-400">
        Page {page} of {totalPages}
      </span>
      <button
        disabled={page === totalPages || isLoading}
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 active:bg-slate-100 rounded-lg transition-colors"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
