import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/press-start-2p/400.css';
import { applyTheme } from './theme/applyTheme';
import { defaultTheme, themes } from './theme/themes';
import { Device } from './overlay/Device';
import './overlay/overlay.css';

applyTheme(themes[defaultTheme]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Device />
  </React.StrictMode>,
);
