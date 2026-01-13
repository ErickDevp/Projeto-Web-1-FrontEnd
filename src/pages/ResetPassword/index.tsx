import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authService } from '../../services/auth/auth.service'
import type { ResetPasswordDTO } from '../../interfaces/auth'
import { getApiErrorMessage } from '../../services/http/httpError'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [formData, setFormData] = useState<ResetPasswordDTO>({
    token: '',
    novaSenha: '',
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token')
    if (tokenFromQuery) {
      setFormData((prev) => ({ ...prev, token: tokenFromQuery }))
    }
  }, [searchParams])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const message = await authService.resetPassword(formData)
      toast.success(message || 'Senha alterada com sucesso!')
      navigate('/login')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold text-center">Redefinir senha</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Token"
          name="token"
          value={formData.token}
          onChange={handleChange}
          required
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Nova senha"
          type="password"
          name="novaSenha"
          value={formData.novaSenha}
          onChange={handleChange}
          required
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Salvar nova senha'}
        </button>

        <div className="mt-4 text-sm text-center flex justify-between">
          <Link className="text-blue-600 hover:underline" to="/forgot-password">
            Gerar token
          </Link>
          <Link className="text-blue-600 hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}
