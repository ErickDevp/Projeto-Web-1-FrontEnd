import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const baseInputClassName =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-fg-primary placeholder:text-fg-secondary/60 focus:border-accent-pool focus:outline-none focus:ring-2 focus:ring-accent-pool/20 transition-all'

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, className = '', id, name, ...props }, ref) => {
    const inputId = id ?? (typeof name === 'string' ? name : undefined)

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-fg-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={`
            ${baseInputClassName} 
            ${error ? '!border-red-500 focus:!border-red-500 focus:!ring-red-500/20' : ''} 
            ${className}
            `.trim()}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
