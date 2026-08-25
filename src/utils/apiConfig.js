export const getApiUrl = () => {
  // 1. If explicit runtime API_PATH is set in window.ENV (e.g., custom URL or relative "")
  if (typeof window !== 'undefined' && window.ENV?.API_PATH !== undefined && window.ENV?.API_PATH !== null && window.ENV.API_PATH !== "") {
    return window.ENV.API_PATH.trim();
  }

  // 2. If running in browser, check if hostname is a remote VPS or server
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location;
    // If running on a remote VPS (not localhost/127.0.0.1)
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // If window.ENV.API_PATH is explicitly empty string "", return "" for relative reverse-proxy routing
      if (window.ENV?.API_PATH === "") {
        return "";
      }
      // Otherwise, automatically target port 8081 on the current VPS host
      return `${protocol}//${hostname}:8081`;
    }
  }

  // 3. Fallback for localhost / local dev environment
  return process.env.REACT_APP_API_URL || 'http://localhost:8081';
};
