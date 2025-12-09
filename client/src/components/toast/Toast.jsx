import { toast } from "sonner";
import { CustomToast } from "./CustomToast"; // Import the component above

const activeToasts = new Map();

export const showToast = (message, type = "success") => {
  const existing = activeToasts.get(message);

  // Helper to render the custom component
  const renderCustomToast = (msg, count) => {
    return toast.custom(
      (t) => (
        <CustomToast
          t={t} // Pass the toast ID so the component can dismiss itself
          type={type}
          message={msg}
          count={count}
        />
      ),
      {
        duration: type === "error" ? 5000 : 3000, // Errors stay longer
      }
    );
  };

  if (existing) {
    // Dismiss old visual
    toast.dismiss(existing.toastId);
    clearTimeout(existing.timeoutId);

    // Update count
    const newCount = existing.count + 1;

    // Render new visual with updated count
    const toastId = renderCustomToast(message, newCount);

    const timeoutId = setTimeout(() => {
      activeToasts.delete(message);
    }, 3000);

    activeToasts.set(message, { toastId, count: newCount, timeoutId });
  } else {
    // Create new
    const toastId = renderCustomToast(message, 1);

    const timeoutId = setTimeout(() => {
      activeToasts.delete(message);
    }, 3000);

    activeToasts.set(message, { toastId, count: 1, timeoutId });
  }
};
