import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'

/**
 * Wraps protected routes — redirects to /login if customer not authenticated.
 * Preserves the intended destination in location state for post-login redirect.
 */
export default function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname, tab: 'login' },
      })
    }
  }, [isAuthenticated, navigate, location])

  if (!isAuthenticated) return null

  return children
}
