import { CheckCircle } from 'lucide-react'
import { services, type Service } from './landingData'

function ServiceCopy({ service }: { service: Service }) {
  return (
    <div className={service.imageRight ? 'order-2 md:order-1' : undefined}>
      <span className="mb-2 block text-xs font-bold tracking-widest text-blue-600 uppercase">Servicio {service.number}</span>
      <h3 className="mb-4 text-3xl font-bold text-slate-900">{service.title}</h3>
      <p className="mb-6 text-slate-600">{service.description}</p>
      {service.bullets && (
        <ul className="space-y-3">
          {service.bullets.map((bullet) => (
            <li key={`${bullet.label ?? ''}${bullet.text}`} className="flex items-start gap-3 text-sm text-slate-700">
              <CheckCircle size={18} className="mt-1 shrink-0 text-blue-600" aria-hidden="true" />
              <span>{bullet.label && <strong>{bullet.label} </strong>}{bullet.text}</span>
            </li>
          ))}
        </ul>
      )}
      {service.cards && (
        <div className="grid grid-cols-2 gap-4">
          {service.cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="mb-1 text-sm font-bold text-slate-800">{card.title}</h4>
              <p className="text-xs text-slate-500">{card.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ServicesSection() {
  return (
    <section id="servicios" className="bg-white px-4 py-20">
      <div className="mx-auto max-w-7xl space-y-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-2 block text-xs font-bold tracking-widest text-blue-600 uppercase">Lo Que Ofrecemos</span>
          <h2 className="text-4xl font-extrabold text-slate-900">Nuestros Servicios Especializados</h2>
        </div>
        {services.map((service) => (
          <article key={service.number} className="grid items-center gap-12 md:grid-cols-2">
            {!service.imageRight && <img src={service.image} alt={service.title} className="h-auto w-full object-contain" loading="lazy" />}
            <ServiceCopy service={service} />
            {service.imageRight && <img src={service.image} alt={service.title} className="w-full object-contain md:order-2" loading="lazy" />}
          </article>
        ))}
      </div>
    </section>
  )
}
