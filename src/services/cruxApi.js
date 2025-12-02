import axios from 'axios';

const KEY = import.meta.env.VITE_CRUX_API_KEY;
if (!KEY) {
  console.warn('VITE_CRUX_API_KEY not set; CrUX requests will fail.');
}

async function queryCruxSingle(body) {
  try {
    // debug input
    const url = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${KEY}`;
    const res = await axios.post(url, body, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (err) {
    console.error('CrUX request failed:', err && err.message ? err.message : err);
    throw err;
  }
}

function normalizeMetrics(cruxResponse, requestedUrl) {
  const record = cruxResponse.record || {};
  const metrics = record.metrics || {};
  const getP75 = (m) => (m && m.percentiles && m.percentiles.p75) || null;

  return {
    url: requestedUrl,
    origin: (record.key && (record.key.origin || record.key.url)) || null,
    lcp_p75: getP75(metrics.largest_contentful_paint || metrics.lcp),
    fcp_p75: getP75(metrics.first_contentful_paint || metrics.fcp),
    cls_p75: getP75(metrics.cumulative_layout_shift || metrics.cls),
    inp_p75: getP75(metrics.interaction_to_next_paint || metrics.inp),
    raw: record
  };
}

/**
 * Request CrUX for multiple urls (mirrors backend behavior).
 * urls: array of url strings
 * options: { mode: 'url'|'origin', formFactor: 'DESKTOP'|'PHONE' }
 */
export async function fetchCruxForUrls(urls = [], options = {}) {
  const { mode = 'url', formFactor = 'DESKTOP' } = options;
  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('Provide urls: [ "https://example.com" ]');
  }

  const calls = urls.map(async (u) => {
    const body = {};
    if (mode === 'origin') body.origin = u;
    else body.url = u;
    body.formFactor = formFactor;

      console.log(u)


    try {
      const data = await queryCruxSingle(body);
      return { ok: true, data: normalizeMetrics(data, u) };
    } catch (err) {
      return { ok: false, url: u, error: err.response ? err.response.data : err.message };
    }
  });

  const results = await Promise.all(calls);

  // compute summary like backend if desired
  const successful = results.filter(r => r.ok).map(r => r.data);
  const numericKeys = ['lcp_p75','fcp_p75','cls_p75','inp_p75'];
  const summary = {};
  numericKeys.forEach(k => {
    const values = successful.map(s => s[k]).filter(v => typeof v === 'number');
    summary[k] = {
      count: values.length,
      avg: values.length ? values.reduce((a,b)=>a+b,0)/values.length : null,
      sum: values.length ? values.reduce((a,b)=>a+b,0) : null
    };
  });

  return { results, summary };
}

// Backwards-compatible named export used by the app.
// `Home.jsx` imports `queryCrux(urls, 'origin')` so expose that signature.
export async function queryCrux(urls, modeOrOptions) {
  const options = typeof modeOrOptions === 'string'
    ? { mode: modeOrOptions }
    : (modeOrOptions || {});
  return fetchCruxForUrls(urls, options);
}
