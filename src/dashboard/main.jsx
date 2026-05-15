import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import DashboardApp from './DashboardApp.jsx';
import '../global.css';

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <DashboardApp />
  </HashRouter>
);
