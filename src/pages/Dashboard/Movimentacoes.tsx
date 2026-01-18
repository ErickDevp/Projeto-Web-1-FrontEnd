import { useEffect, useMemo, useState } from 'react'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../../services/movimentacaoPontos/movimentacaoPontos.service'
import { notify } from '../../utils/notify'
import type { MovimentacaoPontosDTO } from '../../interfaces/movimentacaoPontos'

type Programa = {
  id: number
  nome: string
}

type Cartao = {
  id?: number
  nome?: string
}

type Movimentacao = {
  id?: number
  movimentacaoId?: number
  cartaoId?: number
  programaId?: number
  valor?: number
  pontosCalculados?: number
  data?: string
  status?: string
  [key: string]: unknown
}

const getId = (item: Movimentacao) => item.id ?? item.movimentacaoId ?? 0

export default function Movimentacoes() {
  const [cards, setCards] = useState<Cartao[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<{ cartaoId: string; programaId: string; valor: string }>({
    cartaoId: '',
    programaId: '',
    valor: '',
  })

  const loadData = async () => {
    try {
      const [cardData, programaData, movData] = await Promise.all([
        cartaoUsuarioService.list<Cartao[]>(),
        programaFidelidadeService.list<Programa[]>(),
        movimentacaoPontosService.list<Movimentacao[]>(),
      ])

      setCards(Array.isArray(cardData) ? cardData : [])
      setProgramas(Array.isArray(programaData) ? programaData : [])
      setMovimentacoes(Array.isArray(movData) ? movData : [])
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível carregar as movimentações.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const cardMap = useMemo(() => {
    const map = new Map<number, string>()
    cards.forEach((card) => {
      if (card.id) map.set(card.id, card.nome ?? `Cartão ${card.id}`)
    })
    return map
  }, [cards])

  const programMap = useMemo(() => {
    const map = new Map<number, string>()
    programas.forEach((programa) => map.set(programa.id, programa.nome))
    return map
  }, [programas])

  const startEdit = (item: Movimentacao) => {
    const id = getId(item)
    setEditingId(id)
    setForm({
      cartaoId: String(item.cartaoId ?? ''),
      programaId: String(item.programaId ?? ''),
      valor: item.valor ? String(item.valor) : '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ cartaoId: '', programaId: '', valor: '' })
  }

  const handleSave = async () => {
    if (!editingId) return
    if (!form.cartaoId || !form.programaId || !form.valor) {
      notify.warn('Preencha todos os campos para salvar.')
      return
    }

    const payload: MovimentacaoPontosDTO = {
      cartaoId: Number(form.cartaoId),
      programaId: Number(form.programaId),
      valor: Number(form.valor),
    }

    try {
      await movimentacaoPontosService.update(editingId, payload)
      notify.success('Movimentação atualizada com sucesso.')
      setEditingId(null)
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível atualizar a movimentação.' })
    }
  }

  const handleDelete = async (item: Movimentacao) => {
    const id = getId(item)
    if (!id) return

    try {
      await movimentacaoPontosService.remove(id)
      notify.success('Movimentação removida.')
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível remover a movimentação.' })
    }
  }

  return (
    <section className="space-y-4">
      <header>
        <h1 className="titulo-grafico text-2xl font-bold">Movimentações</h1>
        <p className="mt-1 text-sm text-fg-secondary">Histórico de pontos e movimentações registradas.</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <p className="text-sm text-fg-secondary">Carregando movimentações...</p>
        ) : movimentacoes.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-fg-secondary">
              <thead className="text-xs uppercase tracking-wide text-fg-secondary">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-left">Cartão</th>
                  <th className="px-3 py-2 text-left">Programa</th>
                  <th className="px-3 py-2 text-left">Valor</th>
                  <th className="px-3 py-2 text-left">Pontos</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((item) => {
                  const id = getId(item)
                  const isEditing = editingId === id
                  return (
                    <tr key={id} className="border-t border-white/10">
                      <td className="px-3 py-3 text-xs text-fg-secondary">
                        {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <select
                            value={form.cartaoId}
                            onChange={(event) => setForm((prev) => ({ ...prev, cartaoId: event.target.value }))}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-fg-primary"
                          >
                            <option value="">Selecione</option>
                            {cards.map((card) => (
                              <option key={card.id} value={card.id}>
                                {card.nome ?? `Cartão ${card.id}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-fg-primary">
                            {item.cartaoId ? cardMap.get(item.cartaoId) : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <select
                            value={form.programaId}
                            onChange={(event) => setForm((prev) => ({ ...prev, programaId: event.target.value }))}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-fg-primary"
                          >
                            <option value="">Selecione</option>
                            {programas.map((programa) => (
                              <option key={programa.id} value={programa.id}>
                                {programa.nome}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-fg-primary">
                            {item.programaId ? programMap.get(item.programaId) : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={form.valor}
                            onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-fg-primary"
                          />
                        ) : (
                          <span className="text-fg-primary">
                            {item.valor != null ? Number(item.valor).toLocaleString('pt-BR') : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-fg-primary">
                        {item.pontosCalculados != null
                          ? Number(item.pontosCalculados).toLocaleString('pt-BR')
                          : '-'}
                      </td>
                      <td className="px-3 py-3 text-xs text-fg-secondary">{item.status ?? '-'}</td>
                      <td className="px-3 py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleSave}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-primary hover:bg-white/10"
                            >
                              Salvar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-primary hover:bg-white/10"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-primary hover:bg-white/10"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-fg-primary hover:bg-white/10"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-fg-secondary">Nenhuma movimentação registrada.</p>
        )}
      </div>
    </section>
  )
}
