import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar      from './components/Navbar';
import Home        from './pages/Home';
import EncodeImage from './pages/EncodeImage';
import DecodeImage from './pages/DecodeImage';
import EncodeText  from './pages/EncodeText';
import DecodeText  from './pages/DecodeText';
import Visualize   from './pages/Visualize';
import Docs        from './pages/Docs';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 56px)' }}>
        <Routes>
          <Route path="/"             element={<Home />} />
          <Route path="/encode-image" element={<EncodeImage />} />
          <Route path="/decode-image" element={<DecodeImage />} />
          <Route path="/encode-text"  element={<EncodeText />} />
          <Route path="/decode-text"  element={<DecodeText />} />
          <Route path="/visualize"    element={<Visualize />} />
          <Route path="/docs"         element={<Docs />} />
          <Route path="*"             element={
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>404</div>
              <div style={{ color: '#8888a8' }}>Page not found.</div>
            </div>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
