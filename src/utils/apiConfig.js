export const getApiUrl = () => {
  // 1. If explicit runtime API_PATH is set to a real URL in window.ENV, use it directly
  const envPath = typeof window !== 'undefined' ? window.ENV?.API_PATH : undefined;
  if (envPath && envPath.trim() !== '') {
    return envPath.trim();
  }

  // 2. If running in browser on a remote server (not localhost), auto-target port 8081
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const { protocol, hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:8081`;
    }
  }

  // 3. Fallback for localhost / local dev environment
  return process.env.REACT_APP_API_URL || 'http://localhost:8081';
};
