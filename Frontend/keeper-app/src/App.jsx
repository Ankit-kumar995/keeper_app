import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Maintenance from "./pages/Maintenance";
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ItemList from './pages/ItemList';
import ItemForm from './pages/ItemForm';
import ItemDetail from './pages/ItemDetail';
import Reminders from "./pages/Reminder";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

    {/* Protected routes */}
<Route path="/" element={<ProtectedRoute />}>  {/* sirf ProtectedRoute */}
  
  <Route element={<Layout />}>  {/* Layout ek wrapper route */}
    <Route index element={<Dashboard />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="items" element={<ItemList />} />
    <Route path="items/new" element={<ItemForm />} />
    <Route path="items/edit/:id" element={<ItemForm />} />
    <Route path="items/:id" element={<ItemDetail />} />
     <Route path="/maintenance" element={<Maintenance />} />
     <Route path="/reminders" element={<Reminders />} />
     <Route path="/documents" element={<Documents />} />
     <Route path="/settings" element={<Settings />} />
  </Route>

</Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;