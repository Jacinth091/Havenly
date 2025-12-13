import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  type = "neutral", // Options: 'danger', 'success', 'neutral'
  disabled = false,
  loading = false,
}) => {
  if (!isOpen) return null;

  // --- STYLE CONFIGURATION ---
  const config = {
    danger: {
      icon: AlertTriangle,
      headerBg: "bg-red-50",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700 shadow-red-200",
    },
    success: {
      icon: CheckCircle,
      headerBg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    },
    neutral: {
      icon: Info,
      headerBg: "bg-slate-50",
      iconBg: "bg-slate-200",
      iconColor: "text-slate-600",
      btnBg: "bg-slate-900 hover:bg-slate-800 shadow-slate-200",
    },
  };

  const styles = config[type] || config.neutral;
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div
          className={`px-6 py-5 border-b border-slate-100 flex items-start gap-4 ${styles.headerBg}`}
        >
          <div
            className={`p-3 rounded-full shrink-0 ${styles.iconBg} ${styles.iconColor}`}
          >
            <Icon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {description && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors -mt-1 -mr-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Body Content */}
        {children && <div className="p-6 space-y-4">{children}</div>}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled || loading}
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all flex items-center gap-2 ${styles.btnBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
