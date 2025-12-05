// components/ui/RouteLoading.jsx
import LoadingSpinner from "./Loading";

const RouteLoading = ({
  message = "Preparing your experience...",
  showProgress = true,
}) => {
  return (
    // 1. Apply Flexbox utilities to the main container
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      {/* The content wrapper is no longer necessary for vertical centering, 
        but we keep the max-width and margin-auto for horizontal constraints. 
      */}
      <div className="container mx-auto px-4">
        {/* The loading content wrapper */}
        <div className="max-w-md mx-auto text-center py-16">
          <LoadingSpinner />
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">{message}</h3>
            <p className="text-sm text-gray-500">
              Please wait while we verify your credentials and load your
              dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteLoading;
