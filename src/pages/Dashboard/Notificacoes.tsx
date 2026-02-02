import { useCallback, useEffect, useMemo, useState } from 'react'
import { notificacaoService } from '../../services/notificacao/notificacao.service'
import { usuarioService } from '../../services/usuario/usuario.service'
import { usePreferences } from '../../hooks/usePreferences'
import { notify } from '../../utils/notify'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import TextInput from '../../components/ui/TextInput'
import type { Notificacao, NotificacaoRequestDTO } from '../../interfaces/notificacao'
import type { UsuarioDTO } from '../../interfaces/auth'

// Format relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'agora mesmo'
  if (diffMinutes < 60) return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
  return date.toLocaleDateString('pt-BR')
}

// Notification type colors
const TIPO_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  ALERTA: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400' },
  PROMOCAO: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400' },
  INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: 'text-blue-400' },
  EXPIRACAO: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-400' },
}

export default function Notificacoes() {
  const { preferences } = usePreferences()
  const [items, setItems] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UsuarioDTO | null>(null)

  // Admin form state
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState<NotificacaoRequestDTO>({
    titulo: '',
    mensagem: '',
    tipo: 'INFO',
    prazoDia: 7,
  })

  const isAdmin = user?.role === 'ADMIN'

  // Load notifications and user data
  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [notificacoesData, userData] = await Promise.all([
          notificacaoService.list(),
          usuarioService.getMe(),
        ])
        if (!isActive) return
        setItems(Array.isArray(notificacoesData) ? notificacoesData : [])
        setUser(userData)
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar as notificações.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()
    return () => { isActive = false }
  }, [])

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      await notificacaoService.markAsRead(id)
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, lida: true } : item)))
      // Dispatch event to sync with TopBar
      window.dispatchEvent(new CustomEvent('notification-read', { detail: { id } }))
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível marcar como lida.' })
    }
  }, [])

  // Delete notification (dismiss for user)
  const handleDelete = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering mark as read
    try {
      await notificacaoService.dismiss(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      window.dispatchEvent(new CustomEvent('notification-deleted', { detail: { id } }))
      notify.success('Notificação removida.')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível remover.' })
    }
  }, [])

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    const unread = filteredItems.filter((n) => !n.lida)
    if (unread.length === 0) return

    try {
      await Promise.all(unread.map((n) => notificacaoService.markAsRead(n.id)))
      setItems((prev) =>
        prev.map((item) => (unread.some((n) => n.id === item.id) ? { ...item, lida: true } : item))
      )
      window.dispatchEvent(new CustomEvent('notifications-all-read'))
      notify.success('Todas marcadas como lidas.')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível marcar todas.' })
    }
  }, [filteredItems])

  // Delete all notifications (dismiss for user)
  const handleDeleteAll = useCallback(async () => {
    if (filteredItems.length === 0) return

    try {
      await Promise.all(filteredItems.map((n) => notificacaoService.dismiss(n.id)))
      setItems((prev) => prev.filter((item) => !filteredItems.some((n) => n.id === item.id)))
      window.dispatchEvent(new CustomEvent('notifications-all-deleted'))
      notify.success('Todas as notificações removidas.')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível remover todas.' })
    }
  }, [filteredItems])

  // Admin: Permanently delete notification for all users
  const handleAdminDelete = useCallback(async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Excluir esta notificação permanentemente para TODOS os usuários?')) return

    try {
      await notificacaoService.removeForAll(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      window.dispatchEvent(new CustomEvent('notification-deleted', { detail: { id } }))
      notify.success('Notificação excluída permanentemente.')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível excluir.' })
    }
  }, [])

  // Admin: Permanently delete all notifications
  const handleAdminDeleteAll = useCallback(async () => {
    if (filteredItems.length === 0) return
    if (!confirm('Excluir TODAS as notificações permanentemente para TODOS os usuários?')) return

    try {
      await Promise.all(filteredItems.map((n) => notificacaoService.removeForAll(n.id)))
      setItems((prev) => prev.filter((item) => !filteredItems.some((n) => n.id === item.id)))
      window.dispatchEvent(new CustomEvent('notifications-all-deleted'))
      notify.success('Todas as notificações excluídas permanentemente.')
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível excluir todas.' })
    }
  }, [filteredItems])

  // Create notification (admin only)
  const handleCreate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.titulo.trim() || !formData.mensagem.trim()) {
      notify.warn('Preencha todos os campos.')
      return
    }

    setFormLoading(true)
    try {
      await notificacaoService.create(formData)
      notify.success('Notificação criada com sucesso!')
      setFormData({ titulo: '', mensagem: '', tipo: 'INFO', prazoDia: 7 })
      setShowCreateForm(false)

      // Reload list
      const data = await notificacaoService.list()
      setItems(Array.isArray(data) ? data : [])
      // Notify TopBar to refresh
      window.dispatchEvent(new CustomEvent('notification-created'))
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível criar a notificação.' })
    } finally {
      setFormLoading(false)
    }
  }, [formData])

  const filteredItems = useMemo(() => {
    const matchesWeeklySummary = (item: Notificacao) => {
      if (item.tipo === 'RESUMO' || item.tipo === 'RESUMO_SEMANAL') return true
      const text = `${item.titulo} ${item.mensagem}`.toLowerCase()
      return text.includes('resumo semanal') || text.includes('resumo da semana') || text.includes('semanal')
    }

    return items.filter((item) => {
      if (item.tipo === 'EXPIRACAO') return preferences.notifications.expirationAlerts
      if (item.tipo === 'PROMOCAO') return preferences.notifications.newPromotions
      if (matchesWeeklySummary(item)) return preferences.notifications.weeklySummary
      return true
    })
  }, [items, preferences.notifications.expirationAlerts, preferences.notifications.newPromotions, preferences.notifications.weeklySummary])

  const unreadFilteredCount = filteredItems.filter((n) => !n.lida).length

  return (
    <section className="space-y-6">
      <PageHeader
        title="Notificações"
        description={
          unreadFilteredCount > 0
            ? `Você tem ${unreadFilteredCount} ${unreadFilteredCount > 1 ? 'notificações não lidas' : 'notificação não lida'}.`
            : 'Todas as notificações foram lidas.'
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {filteredItems.length > 0 && (
            <>
              {unreadFilteredCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="btn-secondary text-xs"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ler todas
                </button>
              )}
              <button
                type="button"
                onClick={handleDeleteAll}
                className="btn-secondary text-xs text-red-400 hover:text-red-300"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Ocultar todas
              </button>
            </>
          )}
          {isAdmin && filteredItems.length > 0 && (
            <button
              type="button"
              onClick={handleAdminDeleteAll}
              className="btn-secondary text-xs text-red-500 hover:text-red-400 border-red-500/30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Excluir tudo (Admin)
            </button>
          )}
          {isAdmin && (
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nova notificação
            </button>
          )}
        </div>
      </PageHeader>

      {/* Admin Create Form */}
      {isAdmin && showCreateForm && (
        <div className="dashboard-card !min-h-0 p-6 animate-fadeIn">
          <div className="section-header mb-4">
            <div className="card-icon">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prazoDia" className="block text-xs font-medium text-fg-primary">
                Prazo (dias)
              </label>
              <TextInput
                id="prazoDia"
                type="number"
                min={1}
                value={formData.prazoDia}
                onChange={(e) => {
                  const value = Math.max(1, Number(e.target.value) || 1)
                  setFormData((prev) => ({ ...prev, prazoDia: value }))
                }}
                placeholder="Ex: 7"
                className="px-3 py-2.5"
              />
            </div>
            <div className="flex-1">
              <h2 className="section-title text-base">Criar notificação</h2>
              <p className="text-xs text-fg-secondary">Todos os usuários receberão esta notificação.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="titulo" className="block text-xs font-medium text-fg-primary">
                  Título
                </label>
                <TextInput
                  id="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Pontos expirando"
                  className="px-3 py-2.5"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="tipo" className="block text-xs font-medium text-fg-primary">
                  Tipo
                </label>
                <select
                  id="tipo"
                  value={formData.tipo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tipo: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all"
                >
                  <option value="INFO">Informação</option>
                  <option value="ALERTA">Alerta</option>
                  <option value="PROMOCAO">Promoção</option>
                  <option value="EXPIRACAO">Expiração</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mensagem" className="block text-xs font-medium text-fg-primary">
                Mensagem
              </label>
              <textarea
                id="mensagem"
                rows={3}
                value={formData.mensagem}
                onChange={(e) => setFormData((prev) => ({ ...prev, mensagem: e.target.value }))}
                placeholder="Descreva a notificação..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-fg-primary focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="btn-primary disabled:opacity-50"
              >
                {formLoading ? 'Enviando...' : 'Enviar para todos'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      <div className="dashboard-card !min-h-0 p-6">
        <div className="section-header mb-4">
          <div className="card-icon">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="section-title text-base">Histórico</h2>
          </div>
          {unreadFilteredCount > 0 && (
            <span className="badge">{unreadFilteredCount} nova{unreadFilteredCount > 1 ? 's' : ''}</span>
          )}
        </div>

        {loading ? (
          <LoadingSpinner message="Carregando notificações..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            className="gap-4"
            icon={(
              <svg className="h-12 w-12 text-fg-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            )}
            title=""
            description="Nenhuma notificação encontrada para as preferências atuais."
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const tipoStyle = TIPO_COLORS[item.tipo] ?? TIPO_COLORS.INFO
              const isUnread = !item.lida

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => isUnread && handleMarkAsRead(item.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${isUnread
                    ? `${tipoStyle.bg} ${tipoStyle.border} hover:shadow-lg cursor-pointer`
                    : 'border-white/5 bg-white/[0.02] opacity-70'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 rounded-lg p-2 ${tipoStyle.bg}`}>
                      <svg className={`h-5 w-5 ${tipoStyle.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {item.tipo === 'ALERTA' && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        )}
                        {item.tipo === 'PROMOCAO' && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.835L16.5 21.75l-.398-.915a2.25 2.25 0 00-1.193-1.193L14 19.5l.909-.398a2.25 2.25 0 001.193-1.193L16.5 17l.398.909a2.25 2.25 0 001.193 1.193l.909.398-.909.398a2.25 2.25 0 00-1.193 1.193z" />
                        )}
                        {item.tipo === 'EXPIRACAO' && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                        {item.tipo === 'INFO' && (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        )}
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${isUnread ? 'text-fg-primary' : 'text-fg-secondary'}`}>
                          {item.titulo}
                        </h3>
                        {isUnread && (
                          <span className="flex h-2 w-2 rounded-full bg-accent-pool animate-pulse" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-fg-secondary line-clamp-2">{item.mensagem}</p>
                      <p className="mt-2 text-[0.625rem] text-fg-secondary/60">
                        {item.dataCriacao ? formatRelativeTime(item.dataCriacao) : 'Data desconhecida'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {isUnread && (
                        <span className="hidden sm:inline text-[0.625rem] text-accent-pool font-medium">
                          Clique para ler
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 rounded-lg text-fg-secondary hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                        title="Ocultar notificação"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleAdminDelete(item.id, e)}
                          className="p-1.5 rounded-lg text-fg-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Excluir permanentemente (Admin)"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
