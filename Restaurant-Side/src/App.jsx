import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/Login'
import OwnerDashboard from './pages/OwnerDashboard'
import AnalyticsPage from './pages/Analytics'
import SettingsPage from './pages/Settings'
import OrderScannerPage from './pages/OrderScanner'
import ProfilePage from './pages/Profile'
import WatchmanDashboard from './pages/WatchmanDashboard'
import useOwnerStore from './store/useOwnerStore'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useOwnerStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/scanner" element={<ProtectedRoute><OrderScannerPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/watchman" element={<ProtectedRoute><WatchmanDashboard /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
