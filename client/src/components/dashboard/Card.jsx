const Card = ({
  status = "Available",
  icon,
  menu,
  children,
  footer,
  onClick,
}) => {
  const theme = {
    Occupied: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "hover:border-emerald-300",
    },
    Maintenance: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "hover:border-amber-300",
    },
    Available: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "hover:border-blue-300",
    },
  }[status] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "hover:border-slate-300",
  };

  return (
    <div
      className={`
        relative flex flex-col justify-between
        bg-white rounded-xl p-5
        border border-slate-200 
        shadow-sm hover:shadow-lg hover:-translate-y-1 ${theme.border}
        transition-all duration-300 ease-out
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-10 h-10 rounded-lg ${theme.bg} ${theme.text} flex items-center justify-center transition-colors`}
        >
          {icon}
        </div>
        <div className="relative">{menu}</div>
      </div>
      <div className="mb-6 cursor-pointer grow" onClick={onClick}>
        {children}
      </div>
      {footer && <div className="pt-4 border-t border-slate-100">{footer}</div>}
    </div>
  );
};

export default Card;
