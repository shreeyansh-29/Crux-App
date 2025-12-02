import axios from 'axios';

const RAW_API = import.meta?.env?.VITE_BASE_API_URL;
// Log the env value at runtime for debugging — restart Vite after editing .env
console.log('[cruxApi] import.meta.env.VITE_BASE_API_URL =', RAW_API);
const DEFAULT_API = 'http://localhost:5000';
const API_BASE = (RAW_API || DEFAULT_API).replace(/\/$/, '');
console.log('[cruxApi] computed API_BASE =', API_BASE);

export async function queryCrux(urls, mode = 'origin') {
  const resp = await axios.post(`${API_BASE}/api/crux`, { urls, mode });
  return resp.data;
}

export default { queryCrux };
