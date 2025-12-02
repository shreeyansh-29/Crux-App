export function normalizeMetrics(cruxResponse, requestedUrl) {
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
