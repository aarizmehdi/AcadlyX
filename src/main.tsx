import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from './hooks/useAuthState'; // Custom hook we will create
import App from './App.tsx';
import Login from './components/Login.tsx';
import './index.css';

function Root() {
  const { user, loading } = useAuthState();

  if (loading) {
    return <div className="min-h-screen bg-[#030207] flex items-center justify-center text-indigo-400">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={user ? <App user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
