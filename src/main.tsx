import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/press-start-2p/400.css';
import { Overlay } from './overlay/Overlay';
import './overlay/overlay.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Overlay />
  </React.StrictMode>,
);
