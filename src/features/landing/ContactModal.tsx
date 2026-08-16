import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Send, X } from 'lucide-react'

type ContactModalProps = {
  isOpen: boolean
  onClose: () => void
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    firstInputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>('button, input, textarea, [href], [tabindex]:not([tabindex="-1"])'),
      ).filter((element) => !element.hasAttribute('disabled'))

      const firstElement = focusableElements[0]
      const lastElement = focusableElements.at(-1)

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="contact-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        aria-describedby="contact-modal-description"
        className="contact-modal-panel relative my-auto w-full max-w-xl rounded-3xl border border-blue-400/25 bg-slate-900 p-6 text-white shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario de contacto"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:border-blue-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <span className="mb-2 block text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">Queremos escucharte</span>
        <h2 id="contact-modal-title" className="pr-12 text-2xl font-extrabold sm:text-3xl">Completa nuestro formulario</h2>
        <p id="contact-modal-description" className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          Déjanos tus datos y el motivo de tu consulta. La función de envío se habilitará próximamente.
        </p>

        <form className="mt-7 space-y-4" onSubmit={(event) => event.preventDefault()}>
          <Field label="Nombre completo">
            <input ref={firstInputRef} type="text" placeholder="Tu nombre" className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3.5 text-sm text-white transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
          </Field>
          <Field label="Correo corporativo">
            <input type="email" placeholder="correo@empresa.com" className="w-full rounded-xl border border-slate-700 bg-slate-950/70 p-3.5 text-sm text-white transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
          </Field>
          <Field label="Mensaje">
            <textarea rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 p-3.5 text-sm text-white transition-colors placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
          </Field>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white transition-all hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">
            Enviar mensaje <Send size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>,
    document.body,
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</span>
      {children}
    </label>
  )
}
