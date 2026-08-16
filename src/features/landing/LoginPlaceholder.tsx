import { ArrowLeft, ArrowRight, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LoginPlaceholder() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <img src="/imagenes/logo1.png" alt="Logo SocioManager" className="mx-auto mb-8 h-12 w-auto" />
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Lock aria-hidden="true" /></div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso al sistema</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">La autenticación con Supabase se implementará después de aprobar la interfaz y los formularios del consultor.</p>
        <Link to="/consultor" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700">Ver interfaz de consultor<ArrowRight size={18} aria-hidden="true" /></Link>
        <Link to="/" className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100"><ArrowLeft size={18} aria-hidden="true" />Volver al inicio</Link>
      </section>
    </main>
  )
}
