const LoadingSpinner = ({
  size = "md", // 'sm', 'md', 'lg', 'xl'
  color = "blue", // 'blue', 'indigo', 'green', 'purple', 'gray'
  showText = true,
  text = "Loading...",
  className = "",
  fullScreen = false,
}) => {
  // Size configurations
  const sizeClasses = {
    sm: { spinner: "h-4 w-4 border-2", text: "text-sm" },
    md: { spinner: "h-8 w-8 border-4", text: "text-lg" },
    lg: { spinner: "h-12 w-12 border-4", text: "text-xl" },
    xl: { spinner: "h-16 w-16 border-4", text: "text-2xl" },
  };

  // Color configurations
  const colorClasses = {
    blue: "border-blue-500 border-t-transparent",
    indigo: "border-indigo-500 border-t-transparent",
    green: "border-green-500 border-t-transparent",
    purple: "border-purple-500 border-t-transparent",
    gray: "border-gray-500 border-t-transparent",
  };

  // Text color mappings
  const textColors = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    green: "text-green-600",
    purple: "text-purple-600",
    gray: "text-gray-600",
  };

  const spinnerClasses = `
    ${sizeClasses[size].spinner}
    ${colorClasses[color]}
    rounded-full 
    animate-spin
  `;

  const textClasses = `
    ${sizeClasses[size].text}
    ${textColors[color]}
    ml-3 
    font-medium
  `;

  // Main container
  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={spinnerClasses}
        role="status"
        aria-live="polite"
        aria-label="Loading"
      />
      {showText && <p className={textClasses}>{text}</p>}
    </div>
  );

  // Return fullscreen wrapper if needed
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
