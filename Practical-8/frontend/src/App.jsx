import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { lazyWithDelay } from './utils/lazyHelper';

// Practical 8 Step 2 & Step 5: Route-based Lazy Loading with React.lazy()
// Projects & Contact use lazyWithDelay(..., 300) to demonstrate the minimum-delay fallback
const Projects = lazyWithDelay(() => import('./pages/Projects'), 300);
const Contact = lazyWithDelay(() => import('./pages/Contact'), 300);

// Code-split authenticated and guest page components
const TaskDashboard = lazy(() => import('./pages/TaskDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          {/* Shared Navbar remains eagerly loaded for immediate user interaction */}
          <Navbar />

          <main className="container">
            <ErrorBoundary>
              {/* Suspense wrapper with meaningful accessible PageLoader fallback */}
              <Suspense fallback={<PageLoader message="Loading requested module..." />}>
                <Routes>
                  {/* Public Authentication Routes (Lazy Loaded) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Public Content Routes (Lazy Loaded with 300ms minimum delay) */}
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Protected Task Management Routes (Lazy Loaded) */}
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
              </Suspense>
            </ErrorBoundary>
          </main>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
