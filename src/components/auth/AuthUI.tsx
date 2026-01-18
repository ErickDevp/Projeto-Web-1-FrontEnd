import type { ReactNode } from 'react'
import type { CSSProperties } from 'react'

type PanelProps = {
  embedded?: boolean
  children: ReactNode
}

export function AuthPanel({ embedded, children }: PanelProps) {
  return (
    <div
      className={
        embedded
          ? 'w-full'
          : 'w-full max-w-md rounded-3xl border border-white/10 bg-bg-secondary p-8 shadow-[0_1.5rem_3.75rem_rgba(0,0,0,0.55)]'
      }
    >
      {children}
    </div>
  )
}

type FieldProps = {
  label: string
  name: string
  type?: string
  placeholder?: string
  value: string
  required?: boolean
  autoComplete?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  rightIconLabel?: string
  onRightIconClick?: () => void
  error?: string
  inputStyle?: CSSProperties
  inputRef?: React.Ref<HTMLInputElement>
}

export function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  required,
  autoComplete,
  onChange,
  leftIcon,
  rightIcon,
  rightIconLabel,
  onRightIconClick,
  error,
  inputStyle,
  inputRef,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-fg-primary">{label}</span>
      <span className="relative block">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-secondary">
            {leftIcon}
          </span>
        ) : null}

        <input
          className={
            'w-full rounded-2xl border bg-bg-primary/40 px-4 py-3 text-sm text-fg-primary ' +
            'placeholder:text-fg-secondary/60 shadow-inner outline-none ' +
            'focus:border-accent-sky/60 focus:ring-2 focus:ring-accent-sky/25 ' +
            (error ? 'border-red-500/60 focus:border-red-400/70 focus:ring-red-500/20 ' : 'border-white/10 ') +
            (leftIcon ? 'pl-10 ' : '') +
            (rightIcon ? 'pr-11' : '')
          }
          style={inputStyle}
          ref={inputRef}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
        />

        {rightIcon ? (
          <button
            type="button"
            aria-label={rightIconLabel ?? 'Ação'}
            onClick={onRightIconClick}
            className="absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-transparent text-fg-secondary hover:bg-white/5 hover:text-fg-primary focus:outline-none focus:ring-2 focus:ring-accent-sky/25"
          >
            {rightIcon}
          </button>
        ) : null}
      </span>

      {error ? <span className="mt-2 block text-xs font-semibold text-red-300">{error}</span> : null}
    </label>
  )
}

type ButtonProps = {
  children: ReactNode
  disabled?: boolean
  type?: 'button' | 'submit'
  onClick?: () => void
}

export function PrimaryAuthButton({ children, disabled, type = 'submit', onClick }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-accent-pool py-3 text-sm font-semibold text-black shadow hover:opacity-90 disabled:opacity-60"
    >
      {children}
    </button>
  )
}

export function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.5 7l5.1 4.08a1.5 1.5 0 0 0 1.87 0L18.5 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 11V8.8a5 5 0 0 1 10 0V11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A2.5 2.5 0 0 1 20 13.5v5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-5A2.5 2.5 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.2 12s3.5-7 9.8-7 9.8 7 9.8 7-3.5 7-9.8 7-9.8-7-9.8-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function IconEyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.7a2.8 2.8 0 0 0 3.8 3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6.2 6.6C3.7 8.4 2.2 12 2.2 12s3.5 7 9.8 7c2 0 3.7-.5 5.1-1.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19.8 17.4C21.7 15.8 22.9 14 22.9 14s-3.5-7-9.8-7c-1.1 0-2.2.2-3.1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
