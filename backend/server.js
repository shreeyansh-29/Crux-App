require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CRUX_KEY = process.env.CRUX_API_KEY;
if (!CRUX_KEY) {
  console.error('Set CRUX_API_KEY in .env');
  process.exit(1);
}

/**
 * Query CrUX for a single URL/origin.
 * Using the records:queryRecord endpoint.
 * Docs: https://developer.chrome.com/docs/crux/api/
 */
async function queryCrux(body) {
  const url = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${CRUX_KEY}`;
  const res = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
}

function normalizeMetrics(cruxResponse, requestedUrl) {
  // Extract a few useful metrics if present.
  // The CrUX response structure has "record.metrics" with metric objects.
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
    // include whole record if you want:
    raw: record
  };
}

app.post('/api/crux', async (req, res) => {
  try {
    const { urls = [], mode = 'url', formFactor = 'DESKTOP' } = req.body;
    // urls: array of url strings
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Provide urls: [ "https://example.com" ]' });
    }

    // CrUX limits: be mindful of rate limits (150 rps). We perform concurrent calls with Promise.all
    const calls = urls.map(async (u) => {
      // The CrUX API accepts either "url" or "origin" in body.
      const body = {};
      if (mode === 'origin') body.origin = u;
      else body.url = u;

      // optional: ask for a formFactor (DESKTOP, PHONE)
      body.formFactor = formFactor; 

      try {
        const data = await queryCrux(body);
        return { ok: true, data: normalizeMetrics(data, u) };
      } catch (err) {
        // handle 404s or missing data
        return { ok: false, url: u, error: err.response ? err.response.data : err.message };
      }
    });

    const results = await Promise.all(calls);

    // Build summary: average / sum for numeric fields that are numbers
    const successful = results.filter(r => r.ok).map(r => r.data);
    const numericKeys = ['lcp_p75','fcp_p75','cls_p75','inp_p75'];
    const summary = {};
    numericKeys.forEach(k => {
      const values = successful
        .map(s => s[k])
        .filter(v => typeof v === 'number');
      summary[k] = {
        count: values.length,
        avg: values.length ? values.reduce((a,b)=>a+b,0)/values.length : null,
        sum: values.length ? values.reduce((a,b)=>a+b,0) : null
      };
    });

    res.json({ results, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'server error' });
  }
});

app.listen(PORT, () => {
  console.log(`CrUX proxy server running on ${PORT}`);
});