import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authService } from '../../services/auth/auth.service'
import type { ForgotPasswordDTO } from '../../interfaces/auth'
import { getApiErrorMessage } from '../../services/http/httpError'

export default function ForgotPassword() {
  const [formData, setFormData] = useState<ForgotPasswordDTO>({
    email: '',
  })

  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResetToken(null)

    try {
      const response = await authService.forgotPassword(formData)
      setResetToken(response.reset_token)
      toast.success('Solicitação recebida. Token gerado!')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const copyToken = async () => {
    if (!resetToken) return

    try {
      await navigator.clipboard.writeText(resetToken)
      toast.success('Token copiado!')
    } catch {
      toast.error('Não foi possível copiar o token')
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold text-center">Esqueci minha senha</h2>

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Gerar token de reset'}
        </button>

        {resetToken && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <p className="text-sm font-semibold mb-2">Seu token de reset:</p>
            <code className="block text-xs break-all p-2 bg-white border rounded">{resetToken}</code>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="flex-1 border rounded p-2 hover:bg-gray-100"
                onClick={copyToken}
              >
                Copiar
              </button>
              <Link
                className="flex-1 text-center border rounded p-2 hover:bg-gray-100"
                to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
              >
                Resetar
              </Link>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              No seu backend, o token expira em 30 minutos.
            </p>
          </div>
        )}

        <div className="mt-4 text-sm text-center">
          <Link className="text-blue-600 hover:underline" to="/login">
            Voltar para login
          </Link>
        </div>
      </form>
    </div>
  )
}
