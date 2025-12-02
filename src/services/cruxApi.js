/**
 * CrUX helpers - responsible for batching requests and computing a small
 * summary. Network-level details are delegated to `cruxApiClient` so this
 * module focuses on orchestration and normalization.
 */
import { queryCruxSingle } from './cruxApiClient';
import { normalizeMetrics } from './utils';

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
    // perform the single network call via the API client
    try {
      const data = await queryCruxSingle(body);
      return { ok: true, data: normalizeMetrics(data, u) };
    } catch (err) {
      return { ok: false, url: u, error: err.response ? err.response.data : err.message };
    }
  });

  const results = await Promise.all(calls);

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

export async function queryCrux(urls, modeOrOptions) {
  const options = typeof modeOrOptions === 'string'
    ? { mode: modeOrOptions }
    : (modeOrOptions || {});
  return fetchCruxForUrls(urls, options);
}
