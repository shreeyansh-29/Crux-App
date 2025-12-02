import { useState, Suspense, lazy } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import SearchForm from '../components/SearchForm';
import { queryCrux } from '../services/cruxApi';

const ResultsTable = lazy(() => import('../components/ResultsTable'));

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  async function handleSearch(urls) {
    if (!Array.isArray(urls) || urls.length === 0) return;
    setLoading(true);
    try {
      const resp = await queryCrux(urls, 'origin');
      setData(resp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          CrUX Lookup
        </Typography>
        <Typography variant="body2" gutterBottom>
          Enter one URL per line. Example: https://developer.intuit.com
        </Typography>

        <SearchForm onSearch={handleSearch} loading={loading} />
      </Paper>

      {data && (
        <Box sx={{ mt: 3 }}>
          <Suspense fallback={<div>Loading results...</div>}>
            <ResultsTable results={data.results} summary={data.summary} />
          </Suspense>
        </Box>
      )}
    </Container>
  );
}
