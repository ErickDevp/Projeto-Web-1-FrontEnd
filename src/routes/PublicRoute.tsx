import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * PublicRoute - Guarda de rota que impede usuários autenticados de acessar páginas públicas
 * 
 * Se autenticado: Redireciona para /dashboard
 * Se NÃO autenticado: Renderiza rotas filhas (<Outlet />)
 * 
 * Use isso para envolver páginas de login, registro e outras páginas de autenticação
 * que só devem ser acessíveis a usuários não logados.
 */
export default function PublicRoute() {
    const { isAuthenticated } = useAuth()

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
