import { Award, CheckCircle, Eye, Target } from 'lucide-react'

export function IdentitySection() {
  return (
    <section id="nosotros" className="mx-auto w-full max-w-7xl px-4 py-20">
      <div className="mb-16 grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="mb-2 block text-xs font-bold tracking-widest text-blue-600 uppercase">Nuestra Identidad</span>
          <h2 className="mb-6 text-3xl font-extrabold text-slate-900 md:text-4xl">Excelencia en Inteligencia Humana y Socioeconómica</h2>
          <p className="mb-8 leading-relaxed text-slate-600">En HR Investigations &amp; Socioeconomic Research, somos líderes en la provisión de servicios de investigación de alta fidelidad. Nuestra metodología objetiva y autoritaria asegura que cada dato recolectado sea una base sólida para el crecimiento de su organización.</p>
          <div className="flex gap-8 border-t border-slate-200 pt-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <span className="block text-3xl font-black text-slate-900">15+</span>
              <span className="text-sm text-slate-500">Años de Experiencia</span>
            </div>
            <div className="border-l-4 border-blue-600 pl-4">
              <span className="block text-3xl font-black text-slate-900">99%</span>
              <span className="text-sm text-slate-500">Precisión en Datos</span>
            </div>
          </div>
        </div>
        <div className="relative">
          <img src="/imagenes/identidad.jpg" alt="Identidad de la empresa" className="h-auto w-full object-contain" loading="lazy" />
        </div>
      </div>

      <div className="grid gap-8 border-t border-slate-200 pt-16 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Target size={24} aria-hidden="true" /></div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">Misión</h3>
          <p className="text-sm leading-relaxed text-slate-600">Brindar soluciones integrales en estudios socioeconómicos, investigaciones laborales, incidencias legales, reclutamiento y estrategias de publicidad y marketing, mediante procesos confiables, éticos e innovadores que permitan a nuestros clientes tomar decisiones con seguridad y fortalecer el desarrollo de sus organizaciones.</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Eye size={24} aria-hidden="true" /></div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">Visión</h3>
          <p className="text-sm leading-relaxed text-slate-600">Ser una empresa líder y referente a nivel nacional en servicios de investigación, verificación de información, reclutamiento y soluciones estratégicas para empresas, reconocida por la calidad de nuestros servicios, la innovación tecnológica y el compromiso con la excelencia.</p>
        </article>
        <article className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Award size={24} aria-hidden="true" /></div>
          <h3 className="mb-3 text-xl font-bold text-slate-900">Valores</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            {['Confidencialidad', 'Integridad', 'Objetividad'].map((value) => <li key={value} className="flex items-center gap-2"><CheckCircle size={14} className="text-blue-600" aria-hidden="true" />{value}</li>)}
          </ul>
        </article>
      </div>
    </section>
  )
}
