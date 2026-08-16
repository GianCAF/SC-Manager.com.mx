import { clientLogos } from './landingData'

export function CompaniesSection() {
  return (
    <section aria-label="Empresas que confían en nosotros" className="border-t border-slate-600 bg-slate-50 py-12 text-center">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-6 text-xs font-bold tracking-widest text-slate-400 uppercase">Empresas que confían en nosotros</p>
        <div className="flex flex-wrap items-center justify-center gap-12 transition-all">
          {clientLogos.map((logo) => <img key={logo.src} src={logo.src} alt={logo.alt} className={`${logo.className} max-w-[180px] object-contain`} loading="lazy" />)}
        </div>
      </div>
    </section>
  )
}
