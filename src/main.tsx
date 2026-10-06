import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { googleToolsService } from './services/googleToolsService';

// Inicializar preparación de herramientas de Google y analíticas
googleToolsService.initGoogleAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
