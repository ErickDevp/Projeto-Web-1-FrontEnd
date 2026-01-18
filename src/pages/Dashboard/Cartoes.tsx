import { useEffect, useMemo, useState } from 'react'
import type { BandeiraEnum, TipoCartaoEnum } from '../../interfaces/enums'
import type { CartaoUsuarioDTO } from '../../interfaces/cartaoUsuario'
import { cartaoUsuarioService } from '../../services/cartaoUsuario/cartaoUsuario.service'
import { programaFidelidadeService } from '../../services/programaFidelidade/programaFidelidade.service'
import { notify } from '../../utils/notify'

type Programa = {
  id: number
  nome: string
}

type Cartao = {
  id?: number
  nome?: string
  bandeira?: string
  tipo?: string
  pontos?: number
  programa?: Programa | null
  programas?: Programa[]
}

const BANDEIRAS: BandeiraEnum[] = ['VISA', 'MASTERCARD', 'ELO', 'AMERICAN_EXPRESS', 'HIPERCARD']
const TIPOS: TipoCartaoEnum[] = ['CREDITO', 'DEBITO']

export default function Cartoes() {
  const [cards, setCards] = useState<Cartao[]>([])
  const [programas, setProgramas] = useState<Programa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<{ nome: string; bandeira: BandeiraEnum; tipo: TipoCartaoEnum; pontos: number; programaIds: number[] }>(
    {
      nome: '',
      bandeira: 'VISA',
      tipo: 'CREDITO',
      pontos: 1,
      programaIds: [],
    },
  )

  const loadData = async () => {
    try {
      const [cardData, programaData] = await Promise.all([
        cartaoUsuarioService.list<Cartao[]>(),
        programaFidelidadeService.list<Programa[]>(),
      ])

      setCards(Array.isArray(cardData) ? cardData : [])
      setProgramas(Array.isArray(programaData) ? programaData : [])
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível carregar os cartões.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectedProgramNames = useMemo(() => {
    return programas.filter((p) => form.programaIds.includes(p.id)).map((p) => p.nome)
  }, [form.programaIds, programas])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.nome.trim()) {
      notify.warn('Informe o nome do cartão.')
      return
    }

    if (!form.programaIds.length) {
      notify.warn('Selecione ao menos um programa de fidelidade.')
      return
    }

    setSaving(true)
    const payload: CartaoUsuarioDTO = {
      nome: form.nome.trim(),
      bandeira: form.bandeira,
      tipo: form.tipo,
      pontos: form.pontos,
      programaIds: form.programaIds,
    }

    try {
      await cartaoUsuarioService.create(payload)
      notify.success('Cartão cadastrado com sucesso.')
      setForm((prev) => ({ ...prev, nome: '' }))
      await loadData()
    } catch (error) {
      notify.apiError(error, { fallback: 'Não foi possível cadastrar o cartão.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Cartões</h1>
        <p className="mt-1 text-sm text-fg-secondary">Cadastre e acompanhe seus cartões e programas.</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-bg-secondary/60 p-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-fg-secondary">
            Nome do cartão
            <input
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
              placeholder="Ex: Visa Gold"
            />
          </label>

          <label className="text-sm text-fg-secondary">
            Bandeira
            <select
              value={form.bandeira}
              onChange={(event) => setForm((prev) => ({ ...prev, bandeira: event.target.value as BandeiraEnum }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
            >
              {BANDEIRAS.map((bandeira) => (
                <option key={bandeira} value={bandeira}>
                  {bandeira}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-fg-secondary">
            Tipo
            <select
              value={form.tipo}
              onChange={(event) => setForm((prev) => ({ ...prev, tipo: event.target.value as TipoCartaoEnum }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
            >
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-fg-secondary">
            Multiplicador de pontos
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.pontos}
              onChange={(event) => setForm((prev) => ({ ...prev, pontos: Number(event.target.value) }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm text-fg-secondary">
          Programas associados
          <select
            multiple
            value={form.programaIds.map(String)}
            onChange={(event) => {
              const values = Array.from(event.target.selectedOptions).map((option) => Number(option.value))
              setForm((prev) => ({ ...prev, programaIds: values }))
            }}
            className="mt-2 h-32 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-fg-primary"
          >
            {programas.map((programa) => (
              <option key={programa.id} value={programa.id}>
                {programa.nome}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-fg-secondary">
            Selecionados: {selectedProgramNames.length ? selectedProgramNames.join(', ') : 'nenhum'}
          </p>
        </label>

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-fg-primary hover:bg-white/10"
          >
            {saving ? 'Salvando...' : 'Cadastrar cartão'}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {loading ? (
          <p className="text-sm text-fg-secondary">Carregando cartões...</p>
        ) : cards.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((card, index) => (
              <div
                key={card.id ?? `${card.nome}-${index}`}
                className="rounded-xl border border-white/10 bg-bg-secondary/60 p-4"
              >
                <p className="text-sm font-semibold text-fg-primary">{card.nome ?? `Cartão ${index + 1}`}</p>
                <p className="mt-1 text-xs text-fg-secondary">
                  {[card.bandeira, card.tipo].filter(Boolean).join(' • ') || 'Sem detalhes'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-fg-secondary">Nenhum cartão cadastrado ainda.</p>
        )}
      </div>
    </section>
  )
}
