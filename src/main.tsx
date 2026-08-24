import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { DataProvider } from '@/state/DataContext';

/**
 * HashRouter is used deliberately. GitHub Pages serves static files
 * and has no way to rewrite unknown paths back to index.html, so a
 * normal router breaks as soon as anyone refreshes a page or opens a
 * shared link. With hash routing every URL works after a refresh.
 */
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter>
      <DataProvider>
        <App />
      </DataProvider>
    </HashRouter>
  </StrictMode>,
);
