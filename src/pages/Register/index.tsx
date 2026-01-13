import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import type { RegisterDTO } from '../../interfaces/auth'
import { useAuth } from '../../hooks/useAuth'
import { getApiErrorMessage } from '../../services/http/httpError'

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth()
  
  const [formData, setFormData] = useState<RegisterDTO>({
    nome: '',
    email: '',
    senha: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(formData)
      toast.success('Conta criada com sucesso!')
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
        <h2 className="text-2xl mb-4 font-bold text-center">Criar Conta</h2>
        
        <input 
          className="w-full mb-3 p-2 border rounded"
          placeholder="Nome Completo"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
        />
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
          {loading ? 'Carregando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}