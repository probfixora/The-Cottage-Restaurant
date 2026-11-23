import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/rozha-one/latin-400.css';
import '@fontsource/hind/latin-300.css';
import '@fontsource/hind/latin-400.css';
import '@fontsource/hind/latin-500.css';
import '@fontsource/hind/latin-600.css';
import './styles/global.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
