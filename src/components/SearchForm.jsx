import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

export default function SearchForm({ onSearch, loading = false }) {
  const [urlsText, setUrlsText] = useState('');

  function handleSubmit(e) {
    e && e.preventDefault();
    const urls = urlsText
      .split(/\s*[,\n]\s*/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!urls.length) return;
    onSearch(urls);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="URLs (comma separated)"
        multiline
        minRows={4}
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        fullWidth
        sx={{ my: 2 }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
        <Button variant="outlined" type="button" onClick={() => setUrlsText('')}>
          Clear
        </Button>
      </Box>
    </form>
  );
}
