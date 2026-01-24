import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function useDashboardLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleNavigation = () => {
        setMobileMenuOpen(false)
    }

    const handleLogout = () => {
        logout()
        navigate('/', { replace: true })
    }

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev)
    }

    const closeMobileMenu = () => {
        setMobileMenuOpen(false)
    }

    return {
        searchTerm,
        setSearchTerm,
        mobileMenuOpen,
        handleNavigation,
        handleLogout,
        toggleMobileMenu,
        closeMobileMenu,
    }
}
