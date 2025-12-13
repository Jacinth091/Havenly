export const HavenlyIcon = (props) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props} // This allows className="w-4 h-4" to be applied
    >
      {/* Roof and Walls */}
      <path d="M17 39 L50 15 L83 39 V81 A4 4 0 0 1 79 85 H21 A4 4 0 0 1 17 81 Z" />
      {/* Checkmark */}
      <path d="M37 54 L46 63 L63 41" />
    </svg>
  );
};
