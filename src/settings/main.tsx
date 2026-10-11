import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/press-start-2p/400.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import { SettingsWindow } from './SettingsWindow';
import './settings.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SettingsWindow />
  </React.StrictMode>,
);
