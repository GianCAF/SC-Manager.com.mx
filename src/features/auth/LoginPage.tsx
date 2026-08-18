import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getDefaultRoute } from './authTypes'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const navigate = useNavigate()
  const { profile, loading: sessionLoading, error: sessionError, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  if (!sessionLoading && profile) {
    return <Navigate to={getDefaultRoute(profile.role)} replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFormError('')

    try {
      const signedInProfile = await signIn(email, password)
      navigate(getDefaultRoute(signedInProfile.role), { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No fue posible iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#061833] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.3),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_30%)]" />
      <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-slate-950/40">
        <div className="bg-gradient-to-r from-[#071a38] to-[#164b9d] px-8 py-7 text-white">
          <img src="/imagenes/logo1.png" alt="Logo SC Manager" className="mb-6 h-14 w-auto rounded-full bg-white/95 p-1 shadow-lg" />
          <p className="text-xs font-bold tracking-[0.22em] text-blue-200 uppercase">Portal seguro</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Acceso al sistema</h1>
          <p className="mt-2 text-sm leading-relaxed text-blue-100">Ingresa con la cuenta asignada por SC Manager.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-8 py-8">
          {(formError || sessionError) && (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {formError || sessionError}
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="mb-2 block text-xs font-bold text-slate-700">Correo electrónico</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required disabled={submitting} placeholder="correo@ejemplo.com" className="w-full rounded-xl border border-slate-300 py-3 pr-4 pl-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100" />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-2 block text-xs font-bold text-slate-700">Contraseña</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" size={18} aria-hidden="true" />
              <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required disabled={submitting} placeholder="Ingresa tu contraseña" className="w-full rounded-xl border border-slate-300 py-3 pr-12 pl-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100 disabled:bg-slate-100" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={submitting || sessionLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? <LoaderCircle className="animate-spin" size={19} aria-hidden="true" /> : <LockKeyhole size={19} aria-hidden="true" />}
            {submitting ? 'Validando acceso…' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-xs leading-relaxed text-slate-500">Si todavía no tienes acceso o tu cuenta está bloqueada, comunícate con un administrador.</p>

          <Link to="/" className="mx-auto flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            <ArrowLeft size={17} aria-hidden="true" />Volver al inicio
          </Link>
        </form>
      </section>
    </main>
  )
}
