function backendConnection() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback if env variable is not set
  if (!apiUrl) {
    const defaultUrl = "http://127.0.0.1:8000/api/v1";
    console.warn("VITE_API_URL not set, using default:", defaultUrl);
    return defaultUrl;
  }
  
  // Ensure URL doesn't have trailing slash
  const cleanUrl = apiUrl.replace(/\/$/, '');
  console.log("Using API URL:", cleanUrl);
  return cleanUrl;
}
export default backendConnection;
