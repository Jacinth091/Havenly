const Badge = ({ children, color }) => {
  const styles = {
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        styles[color] || styles.slate
      }`}
    >
      {children}
    </span>
  );
};

export default Badge;
