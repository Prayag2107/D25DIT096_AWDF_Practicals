import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TaskDashboard from './pages/TaskDashboard';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="container">
          <Routes>
            <Route path="/" element={<TaskDashboard />} />
            <Route path="/tasks" element={<TaskDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
