// src/components/ResultsTable.js
import React, { useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Typography, Box, Select, MenuItem, TextField, FormControl, InputLabel, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ReportColumns } from './constants';

export default function ResultsTable({ results = [], summary = {} }) {
  const [metric, setMetric] = useState('lcp_p75');
  const [operator, setOperator] = useState('>=');
  const [threshold, setThreshold] = useState('');
  // Map results to rows. Results is an array of {ok: true/false, data: {...}} or errors
  const rows = results.map((r, idx) => {
    if (!r.ok) {
      return {
        id: idx,
        url: r.url,
        status: 'error',
        error: JSON.stringify(r.error).slice(0,200)
      };
    }
    const d = r.data;
    return {
      id: idx,
      url: d.url,
      origin: d.origin,
      lcp_p75: d.lcp_p75,
      fcp_p75: d.fcp_p75,
      cls_p75: d.cls_p75,
      inp_p75: d.inp_p75
    };
  });

  // Apply threshold filtering
  const filteredRows = useMemo(() => {
    if (threshold === '' || threshold === null) return rows;
    const t = Number(threshold);
    if (Number.isNaN(t)) return rows;
    return rows.filter((r) => {
      const v = r[metric];
      if (v === null || v === undefined) return false;
      if (operator === '>=') return Number(v) >= t;
      if (operator === '<=') return Number(v) <= t;
      return true;
    });
  }, [rows, metric, operator, threshold]);


  // Summary rows for display (converted to array)
  const summaryRows = useMemo(() => {
    const s = [];
    for (const k of Object.keys(summary)) {
      const info = summary[k];
      s.push({ metric: k, avg: info.avg, sum: info.sum, count: info.count });
    }
    return s;
  }, [summary]);

  return (
    <div>
      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="h6">Summary</Typography>
        {summaryRows.map((r) => (
          <div key={r.metric}>
            <strong>{r.metric}:</strong> avg={r.avg ? Number(r.avg).toFixed(2) : 'N/A'} | sum={r.sum ? Number(r.sum).toFixed(2) : 'N/A'} | count={r.count}
          </div>
        ))}
      </Paper>

      <Paper sx={{ p:2, mb:2 }}>
        <Typography variant="subtitle1">Filter results</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt:1 }}>
          <FormControl size="small">
            <InputLabel id="metric-select-label">Metric</InputLabel>
            <Select
              labelId="metric-select-label"
              value={metric}
              label="Metric"
              onChange={(e) => setMetric(e.target.value)}
            >
              <MenuItem value="lcp_p75">LCP p75 (ms)</MenuItem>
              <MenuItem value="fcp_p75">FCP p75 (ms)</MenuItem>
              <MenuItem value="cls_p75">CLS p75</MenuItem>
              <MenuItem value="inp_p75">INP p75 (ms)</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={operator}
            exclusive
            onChange={(e, val) => { if (val) setOperator(val); }}
            size="small"
          >
            <ToggleButton value=">=">{'>='}</ToggleButton>
            <ToggleButton value="<=">{'<='}</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            size="small"
            label="Threshold"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            sx={{ width: 140 }}
          />

          <Typography variant="body2" color="text.secondary">(empty = no filter)</Typography>
        </Box>
      </Paper>

      <div style={{ height: 450, width: '100%' }}>
        <DataGrid rows={filteredRows} columns={ReportColumns} pageSize={10} rowsPerPageOptions={[5,10,25]} />
      </div>
    </div>
  );
}
