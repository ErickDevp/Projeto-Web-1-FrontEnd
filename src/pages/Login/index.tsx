import { useEffect, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import type { LoginDTO } from '../../interfaces/auth'
import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../services/http/httpError'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const reason = sessionStorage.getItem('auth:redirectReason')
    if (reason) {
      sessionStorage.removeItem('auth:redirectReason')
      toast.info(reason)
    }
  }, [])

  const [formData, setFormData] = useState<LoginDTO>({
    email: '',
    senha: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData)
      toast.success('Login realizado com sucesso!')
      navigate('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 font-bold text-center">Entrar</h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Senha"
          type="password"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Entrar'}
        </button>

        <div className="mt-4 text-sm flex justify-between">
          <Link className="text-blue-600 hover:underline" to="/forgot-password">
            Esqueci minha senha
          </Link>
          <Link className="text-blue-600 hover:underline" to="/register">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  )
}
