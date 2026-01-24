import { Outlet } from 'react-router-dom'

/**
 * AuthLayout - Wrapper de layout para páginas de autenticação e legais
 * Centraliza o conteúdo verticalmente e horizontalmente com o fundo do aplicativo
 */
export default function AuthLayout() {
    return (
        <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
            {/* Sobreposição sutil de gradiente */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(73,197,182,0.15),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(39,121,167,0.1),transparent)]" />
            </div>

            {/* Container de conteúdo centralizado */}
            <div className="w-full max-w-md">
                <Outlet />
            </div>
        </div>
    )
}
