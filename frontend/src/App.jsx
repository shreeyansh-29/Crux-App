// src/App.js
import { Suspense, lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading app...</div>}>
      <Home />
    </Suspense>
  );
}
