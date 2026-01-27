import { Outlet } from 'react-router-dom'
import TopBar from '../../components/topbar/TopBar'
import { Sidebar } from '../../components/sidebar/Sidebar'
import { MobileToggle } from '../../components/ui/MobileToggle'
import { useDashboardLayout } from '../../hooks/useDashboardLayout'

export default function DashboardLayout() {
  const {
    searchTerm,
    setSearchTerm,
    mobileMenuOpen,
    handleNavigation,
    handleLogout,
    toggleMobileMenu,
    closeMobileMenu,
  } = useDashboardLayout()

  return (
    <div className="min-h-screen bg-bg-primary text-fg-primary font-sans selection:bg-accent-pool/30">
      {/* Botão do Menu Mobile - Flutuante ou Barra Superior */}
      <MobileToggle isOpen={mobileMenuOpen} onToggle={toggleMobileMenu} />

      {/* Overlay da Sidebar Mobile */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMobileMenu}
      />

      <div className="flex min-h-screen">
        {/* Sidebar - Fixa em todos os tamanhos de tela */}
        <Sidebar mobileMenuOpen={mobileMenuOpen} onNavigate={handleNavigation} onLogout={handleLogout} />

        <main className="flex-1 w-full min-w-0 transition-all duration-300 md:ml-28 lg:ml-32">
          {/* Limitador de largura para telas ultra-wide */}
          <div className="mx-auto max-w-[100rem] px-4 py-4 md:px-8 md:py-6 lg:px-10">
            <div className="mb-6 md:mb-8 pt-12 md:pt-0">
              <TopBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            </div>
            <div className="animate-fadeIn">
              <Outlet context={{ searchTerm }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
