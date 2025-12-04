# Crux App

Live URL: https://crux-app-rho.vercel.app/

## Getting started
```  
git clone https://github.com/shreeyansh-29/Crux-App
cd Crux-App
npm install  
```  
Running the below command will start the application  
```  
npm run dev
#(Local application will run on port 5173)  

```
## Project Overview
This repository contains a small React app for looking up Chrome User Experience (CrUX) metrics for one or more URLs.

Tech used
- React (functional components + Suspense/lazy)
- Material UI (MUI) for layout and controls
- MUI DataGrid for tabular results
- Axios for API requests

What it does
- Accepts one or more URLs (comma- or newline-separated) via the search form.
- Queries the Chrome UX Report (CrUX) API (through `src/services/cruxApiClient.js`).
- Normalizes and displays per-URL metrics (LCP p75, FCP p75, CLS p75, INP p75).
- Shows a computed summary (count, avg, sum) for numeric metrics.
- Provides filtering by metric and threshold, plus pagination in the results table.

Important files
- `src/pages/Home.jsx` – main page and search orchestration.
- `src/components/SearchForm.jsx` – input form for URLs.
- `src/components/ResultsTable.jsx` – summary, filters and results DataGrid.
- `src/services/cruxApi.js` and `src/services/cruxApiClient.js` – request orchestration and network client.

Environment
- The app expects a CrUX API key in `VITE_CRUX_API_KEY`. Optionally set `VITE_BASE_API_URL` to proxy requests.
- If the key is missing, requests will fail and a warning is logged to the console.

Usage notes
- Enter one URL per line or comma-separated, then click `Search`.
- Errors for individual URLs are shown in the results grid; successful responses are normalized and included in the summary.
- Consider optimizing large demo GIFs used in the repository to keep the repo size small.

  
## Prerequisites
1.IDE (visual studio)  

2.npm version 10.9.2

3.react v19.2.0

4.node v22.13.0

