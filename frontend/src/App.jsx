import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';

// The admin panel is only downloaded when someone opens /admin.
const Admin = lazy(() => import('./pages/Admin.jsx'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="page-loading">Loading admin…</div>}>
            <Admin />
          </Suspense>
        }
      />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
