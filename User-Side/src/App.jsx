import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/Landing'
import RoutePlannerPage from './pages/RoutePlanner'
import DiscoveryPage from './pages/Discovery'
import RestaurantDetailsPage from './pages/RestaurantDetails'
import CheckoutPage from './pages/Checkout'
import TrackingPage from './pages/Tracking'
import PickupPage from './pages/Pickup'
import ProfilePage from './pages/Profile'
import CustomerAuthPage from './pages/CustomerAuth'
import QRLandingPage from './pages/QRLanding'
import AuthGuard from './components/AuthGuard'
import GlobalNavbar from './components/Navigation/GlobalNavbar'
import useAutoSync from './hooks/useAutoSync'

function AppContent() {
  // Real-time Socket.io sync (replaces 3s localStorage polling)
  useAutoSync()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Toaster position="top-right" />
      <GlobalNavbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<CustomerAuthPage />} />
        <Route path="/register" element={<CustomerAuthPage />} />
        <Route path="/plan-route" element={<RoutePlannerPage />} />
        <Route path="/discovery" element={<DiscoveryPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />

        {/* QR code scan landing */}
        <Route path="/r/:restaurantId" element={<QRLandingPage />} />

        {/* Protected routes — requires customer login */}
        <Route path="/checkout" element={<AuthGuard><CheckoutPage /></AuthGuard>} />
        <Route path="/tracking/:id" element={<AuthGuard><TrackingPage /></AuthGuard>} />
        <Route path="/pickup/:id" element={<AuthGuard><PickupPage /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><ProfilePage /></AuthGuard>} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App

