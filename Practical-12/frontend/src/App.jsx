import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TaskDashboard from './pages/TaskDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
          <div className="container">
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Task Management Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <TaskDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <TaskDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
