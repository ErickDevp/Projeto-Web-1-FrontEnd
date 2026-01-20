import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * PublicRoute - Route guard that prevents authenticated users from accessing public pages
 * 
 * If user is authenticated: Redirects to /dashboard
 * If user is NOT authenticated: Renders child routes (<Outlet />)
 * 
 * Use this to wrap login, register, and other auth pages that should
 * only be accessible to non-logged-in users.
 */
export default function PublicRoute() {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
