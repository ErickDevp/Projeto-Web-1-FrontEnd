import { useEffect, useState } from 'react'
import { notificacaoService } from '../../services/notificacao/notificacao.service'
import { notify } from '../../utils/notify'

type Notificacao = {
  id?: number
  titulo?: string
  mensagem?: string
  tipo?: string
  createdAt?: string
}

export default function Notificacoes() {
  const [items, setItems] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const data = await notificacaoService.listPublicas<Notificacao[]>()
        if (!isActive) return
        setItems(Array.isArray(data) ? data : [])
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar as notificações.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <section className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Notificações</h1>
        <p className="mt-1 text-sm text-fg-secondary">Histórico de alertas e promoções.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <p className="text-sm text-fg-secondary">Carregando notificações...</p>
        ) : items.length ? (
          <ul className="space-y-3 text-sm text-fg-secondary">
            {items.map((item, index) => (
              <li key={item.id ?? `${item.titulo}-${index}`}>
                <p className="font-semibold text-fg-primary">{item.titulo ?? 'Notificação'}</p>
                <p className="text-xs text-fg-secondary">{item.mensagem ?? 'Sem mensagem.'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-secondary">Nenhuma notificação registrada.</p>
        )}
      </div>
    </section>
  )
}
