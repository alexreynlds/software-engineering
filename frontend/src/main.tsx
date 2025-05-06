import ReactDom from 'react-dom/client';
import { Toaster } from 'sonner';
import { StrictMode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import './index.css';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';
import { AuthProvider } from './hooks/auth';
import ProtectedRoute from './components/ProtectedRoute';

ReactDom.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
