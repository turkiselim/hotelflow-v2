import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import MembersPage from './pages/MembersPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function Guard({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Guard><AppLayout /></Guard>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projet/:id" element={<ProjectPage />} />
        <Route path="/membres" element={<MembersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/rapports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}