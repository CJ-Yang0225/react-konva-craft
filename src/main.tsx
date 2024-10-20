import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app.tsx';

import './index.css';

import { Provider as JotaiProvider } from 'jotai';

import { canvasStore } from './stores/canvasStore.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JotaiProvider store={canvasStore}>
      <App />
    </JotaiProvider>
  </StrictMode>
);
