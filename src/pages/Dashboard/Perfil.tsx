import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usuarioService } from '../../services/usuario/usuario.service'
import { useAuth } from '../../hooks/useAuth'
import { notify } from '../../utils/notify'

type UserData = {
  id: number
  nome: string
  email: string
}

export default function Perfil() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // States
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const [userData, setUserData] = useState<UserData | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Form state
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')

  // Load user data
  useEffect(() => {
    let isActive = true
    let objectUrl: string | null = null

    const loadData = async () => {
      try {
        const [user, photoBlob] = await Promise.all([
          usuarioService.getMe(),
          usuarioService.getFoto().catch(() => null),
        ])

        if (!isActive) return

        setUserData(user)
        setNome(user.nome)
        setEmail(user.email)

        if (photoBlob && photoBlob.size > 0) {
          objectUrl = URL.createObjectURL(photoBlob)
          setPhotoUrl(objectUrl)
        }
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar os dados do perfil.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  // Handle photo upload
  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      notify.error('Por favor, selecione uma imagem válida.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      notify.error('A imagem deve ter no máximo 5MB.')
      return
    }

    setUploadingPhoto(true)
    try {
      await usuarioService.uploadFoto(file)

      // Create preview
      const newUrl = URL.createObjectURL(file)
      setPhotoUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return newUrl
      })

      notify.success('Foto atualizada com sucesso!')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível atualizar a foto.' })
    } finally {
      setUploadingPhoto(false)
    }
  }, [])

  // Handle form submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      notify.error('O nome é obrigatório.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      notify.error('Informe um e-mail válido.')
      return
    }

    setSaving(true)
    try {
      await usuarioService.updateMe({
        nome: nome.trim(),
        email: email.trim(),
      })

      notify.success('Dados atualizados com sucesso!')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível atualizar os dados.' })
    } finally {
      setSaving(false)
    }
  }, [nome, email, userData?.id])

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmText !== 'EXCLUIR') return

    setDeleting(true)
    try {
      await usuarioService.deleteMe()
      notify.success('Conta excluída com sucesso.')
      logout()
      navigate('/', { replace: true })
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível excluir a conta.' })
      setDeleting(false)
    }
  }, [deleteConfirmText, logout, navigate])

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <header>
          <h1 className="titulo-grafico text-2xl font-bold">Meu perfil</h1>
          <p className="mt-1 text-sm text-fg-secondary">Gerencie seus dados pessoais e preferências.</p>
        </header>
        <div className="dashboard-card flex items-center justify-center gap-4 py-12">
          <div className="relative">
            <div className="h-10 w-10 rounded-full border-2 border-accent-pool/20" />
            <div className="absolute inset-0 h-10 w-10 rounded-full border-2 border-transparent border-t-accent-pool animate-spin" />
          </div>
          <span className="text-sm text-fg-secondary">Carregando dados do perfil...</span>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="titulo-grafico text-2xl font-bold">Meu perfil</h1>
        <p className="mt-1 text-sm text-fg-secondary">Gerencie seus dados pessoais e preferências.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar Card */}
        <div className="dashboard-card lg:col-span-1">
          <div className="section-header">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="section-title">Foto de perfil</h2>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            {/* Avatar with upload overlay */}
            <div className="group relative">
              <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-accent-pool/30 shadow-lg shadow-accent-pool/20">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-sky to-accent-pool">
                    <span className="text-3xl font-bold text-white">
                      {userData?.nome ? getInitials(userData.nome) : '?'}
                    </span>
                  </div>
                )}

                {/* Upload overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {uploadingPhoto ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-2 -z-10 rounded-full bg-gradient-to-r from-accent-sky to-accent-pool opacity-20 blur-xl" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />

            <p className="mt-4 text-center text-sm text-fg-secondary">
              Clique na foto para alterar
            </p>
            <p className="mt-1 text-center text-xs text-fg-secondary/70">
              JPG, PNG ou GIF. Máximo 5MB.
            </p>
          </div>
        </div>

        {/* Personal Data Card */}
        <div className="dashboard-card lg:col-span-2">
          <div className="section-header">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="section-title">Dados pessoais</h2>
            </div>
            <span className="badge">Editável</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Nome field */}
            <div className="space-y-2">
              <label htmlFor="nome" className="block text-sm font-medium text-fg-primary">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
              />
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-fg-primary">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="dashboard-card border-red-500/30 bg-red-500/5">
        <div className="section-header">
          <div className="card-icon bg-red-500/20 text-red-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-400">Zona de perigo</h2>
            <p className="text-sm text-fg-secondary">Ações irreversíveis para sua conta</p>
          </div>
        </div>

        <div className="mt-6">
          {!showDeleteConfirm ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium text-fg-primary">Excluir conta permanentemente</h3>
                <p className="mt-1 text-sm text-fg-secondary">
                  Ao excluir sua conta, todos os seus dados serão removidos permanentemente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Excluir minha conta
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">
              <h3 className="font-medium text-red-400">Confirmar exclusão</h3>
              <p className="mt-2 text-sm text-fg-secondary">
                Esta ação é <strong className="text-red-400">irreversível</strong>. Para confirmar, digite{' '}
                <code className="rounded bg-red-500/20 px-2 py-0.5 font-mono text-red-400">EXCLUIR</code>{' '}
                abaixo:
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Digite EXCLUIR para confirmar"
                className="mt-4 w-full rounded-xl border border-red-500/30 bg-bg-primary px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'EXCLUIR' || deleting}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Confirmar exclusão
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
