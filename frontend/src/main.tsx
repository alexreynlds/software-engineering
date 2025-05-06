import ReactDom from 'react-dom/client';
import { Toaster } from 'sonner';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

ReactDom.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <Toaster/>
    </BrowserRouter>
  </StrictMode>,
);
