const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const buildApiUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;
