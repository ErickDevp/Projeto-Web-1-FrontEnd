import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'

export default function Home() {
  const { isAuthenticated, token, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast.info('Você saiu da sua conta.')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4">Home</h1>

        <div className="p-3 border rounded bg-gray-50">
          <p className="font-semibold">
            Status: {isAuthenticated ? 'Autenticado' : 'Não autenticado'}
          </p>
          {isAuthenticated && token && (
            <p className="text-xs text-gray-600 mt-2 break-all">
              Token (início): <span className="font-mono">{token.slice(0, 20)}...</span>
            </p>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {isAuthenticated ? (
            <button
              type="button"
              className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                className="flex-1 text-center bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                to="/login"
              >
                Login
              </Link>
              <Link
                className="flex-1 text-center border p-2 rounded hover:bg-gray-50"
                to="/register"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <div className="mt-4 text-sm flex justify-between">
          <Link className="text-blue-600 hover:underline" to="/forgot-password">
            Esqueci a senha
          </Link>
          <Link className="text-blue-600 hover:underline" to="/reset-password">
            Resetar senha
          </Link>
        </div>
      </div>
    </div>
  )
}
