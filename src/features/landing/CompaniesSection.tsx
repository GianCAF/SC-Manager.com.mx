import { clientLogos } from './landingData'

export function CompaniesSection() {
  return (
    <section aria-label="Empresas que confían en nosotros" className="border-t border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef4fb_100%)] py-14 text-center sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-xs font-bold tracking-[0.22em] text-blue-700 uppercase">Confianza que nos respalda</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Empresas que confían en nosotros</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">Organizaciones que eligen nuestro compromiso, precisión y experiencia para tomar mejores decisiones.</p>

        <ul className="mt-10 grid grid-cols-2 items-stretch overflow-hidden rounded-2xl border border-slate-200/80 bg-white/35 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.45)] sm:grid-cols-3 lg:grid-cols-5">
          {clientLogos.map((logo) => (
            <li key={logo.alt} className="flex min-h-32 items-center justify-center border-b border-r border-slate-200/80 p-5 last:border-r-0 sm:min-h-36 lg:border-b-0">
              <a
                href={logo.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visitar el sitio de ${logo.alt}`}
                className="group flex h-full w-full items-center justify-center rounded-xl px-2 outline-none transition duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className={`${logo.className} w-full max-w-[180px] object-contain opacity-75 saturate-[0.85] transition duration-300 group-hover:opacity-100 group-hover:saturate-100`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
