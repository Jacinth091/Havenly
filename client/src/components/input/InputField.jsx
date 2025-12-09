import { Eye, EyeOff } from "lucide-react";

export const InputField = ({
  label,
  icon: Icon,
  type,
  name, // 1. ADD THIS
  placeholder,
  value,
  onChange,
  error,
  toggleIcon,
  showPassword,
  onToggle,
  required = false,
  autoFocus = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={20} />
          </div>
        )}

        <input
          type={type}
          name={name} // 2. ADD THIS. This connects the input to your handleChange logic.
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoFocus={autoFocus}
          className={`w-full py-3 border rounded-lg transition-all outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            Icon ? "pl-10" : "pl-4"
          } ${toggleIcon ? "pr-12" : "pr-4"} ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30"
              : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 hover:border-slate-300 bg-white"
          }`}
        />

        {/* Toggle Password Visibility Button */}
        {toggleIcon && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
