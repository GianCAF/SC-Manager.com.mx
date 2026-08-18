import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

export function CandidatePortal() {
  const { profile, signOut } = useAuth()

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><ShieldCheck size={30} /></div>
        <p className="mt-6 text-xs font-bold tracking-[0.18em] text-blue-600 uppercase">Cuenta validada</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-900">Bienvenido, {profile?.full_name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">Tu portal de cliente está preparado para la siguiente fase. Aquí podrás consultar posteriormente el avance y la información autorizada de tu estudio.</p>
        <button type="button" onClick={() => void signOut()} className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a38] px-5 py-3 text-sm font-bold text-white hover:bg-[#102b54]"><LogOut size={18} />Cerrar sesión</button>
      </section>
    </main>
  )
}
