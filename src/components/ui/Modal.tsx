import { useCallback, useEffect, useRef } from 'react'
import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  title?: string
  onClose: () => void
}>

export default function Modal({ title, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  const requestClose = useCallback(() => {
    // Tenta evitar prompts de senha/credenciais limpando campos sensíveis antes de navegar.
    const panel = panelRef.current
    if (panel) {
      const inputs = Array.from(panel.querySelectorAll('input')) as HTMLInputElement[]
      for (const input of inputs) {
        const name = (input.getAttribute('name') ?? '').toLowerCase()
        const autoComplete = (input.getAttribute('autocomplete') ?? '').toLowerCase()
        const type = (input.getAttribute('type') ?? '').toLowerCase()

        const looksSensitive =
          type === 'password' ||
          name.includes('senha') ||
          name.includes('password') ||
          autoComplete.includes('password')

        if (!looksSensitive) continue

        try {
          input.value = ''
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
        } catch {
          // ignore
        }
      }
    }

    // chama após limpar, para dar chance do React processar eventos
    setTimeout(() => onClose(), 0)
  }, [onClose])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [requestClose])

  useEffect(() => {
    // foco básico no painel
    panelRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Janela'}
      onMouseDown={(e) => {
        // fechar ao clicar fora do painel
        if (e.target === e.currentTarget) requestClose()
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-bg-secondary p-6 shadow-[0_24px_60px_rgba(0,0,0,0.65)] focus:outline-none"
      >
        <button
          type="button"
          onClick={requestClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-red-400 hover:bg-white/10 hover:text-red-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {children}
      </div>
    </div>
  )
}
