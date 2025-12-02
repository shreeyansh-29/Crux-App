import axios from 'axios';

const KEY = import.meta.env.VITE_CRUX_API_KEY;
const API_URL = import.meta.env.VITE_BASE_API_URL;

if (!KEY) {
  console.warn('VITE_CRUX_API_KEY not set; CrUX requests will fail.');
}

/**
 * Send a single CrUX query to the API.
 * The calling code provides the request body. This function builds the
 * final endpoint using either `VITE_BASE_API_URL` (if provided) or the
 * official CrUX endpoint.
 */
export async function queryCruxSingle(body) {
  if (!KEY) {
    throw new Error('Missing CrUX API key (VITE_CRUX_API_KEY)');
  }

  try {
    const url = API_URL ? `${API_URL}?key=${KEY}` : `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${KEY}`;
    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    // Preserve original logging behaviour for easier debugging.
    console.error('CrUX request failed:', err && err.message ? err.message : err);
    throw err;
  }
}

export default {
  queryCruxSingle
};
