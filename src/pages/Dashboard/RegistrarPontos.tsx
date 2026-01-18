import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { movimentacaoPontosService } from '../../services/movimentacaoPontos/movimentacaoPontos.service'
import { comprovanteService } from '../../services/comprovante/comprovante.service'
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

export default function RegistrarPontos() {
  const [cards, setCards] = useState<Cartao[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{ cartaoId: string; programaId: string; valor: string }>({
    cartaoId: '',
    programaId: '',
    valor: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    let isActive = true

    const loadData = async () => {
      try {
        const [cardData, programaData] = await Promise.all([
          cartaoUsuarioService.list<Cartao[]>(),
          programaFidelidadeService.list<Programa[]>(),
        ])

        if (!isActive) return

        setCards(Array.isArray(cardData) ? cardData : [])
        setProgramas(Array.isArray(programaData) ? programaData : [])
      } catch (error) {
        notify.apiError(error, { fallback: 'Não foi possível carregar cartões e programas.' })
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadData()

    return () => {
      isActive = false
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!form.cartaoId || !form.programaId || !form.valor) {
      notify.warn('Preencha todos os campos obrigatórios.')
      return
    }

    setSaving(true)

    const payload: MovimentacaoPontosDTO = {
      cartaoId: Number(form.cartaoId),
      programaId: Number(form.programaId),
      valor: Number(form.valor),
    }

    try {
      const movimentacaoId = await movimentacaoPontosService.create(payload)

      if (file) {
        await comprovanteService.create({ movimentacaoId: Number(movimentacaoId), file })
      }

      notify.success('Movimentação registrada com sucesso.')
      setForm({ cartaoId: '', programaId: '', valor: '' })
      setFile(null)
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível registrar a movimentação.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Registrar pontos</h1>
            <p className="mt-1 text-sm text-fg-secondary">
              Informe novos pontos ou transferências realizadas.
            </p>
          </div>
          <NavLink
            to="/dashboard/movimentacoes"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-fg-primary hover:bg-white/10"
          >
            Ver movimentações
          </NavLink>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <p className="text-sm text-fg-secondary">Carregando dados...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-fg-secondary">
              Cartão
              <select
                value={form.cartaoId}
                onChange={(event) => setForm((prev) => ({ ...prev, cartaoId: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
              >
                <option value="">Selecione</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.nome ?? `Cartão ${card.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-fg-secondary">
              Programa de fidelidade
              <select
                value={form.programaId}
                onChange={(event) => setForm((prev) => ({ ...prev, programaId: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
              >
                <option value="">Selecione</option>
                {programas.map((programa) => (
                  <option key={programa.id} value={programa.id}>
                    {programa.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-fg-secondary">
              Valor da compra
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.valor}
                onChange={(event) => setForm((prev) => ({ ...prev, valor: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
                placeholder="0,00"
              />
            </label>

            <label className="text-sm text-fg-secondary">
              Comprovante (PDF, PNG ou JPG)
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-accent-pool/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent-pool"
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-fg-primary hover:bg-white/10"
          >
            {saving ? 'Enviando...' : 'Registrar movimentação'}
          </button>
        </div>
      </form>
    </section>
  )
}
