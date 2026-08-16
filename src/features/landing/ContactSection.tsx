import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa'

export function ContactSection() {
  return (
    <section id="contacto" className="bg-slate-900 px-4 py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-2 block text-xs font-bold tracking-widest text-blue-400 uppercase">Estamos para atenderte</span>
          <h2 className="text-4xl font-extrabold">Ponte en Contacto</h2>
          <p className="mt-4 text-sm text-slate-400">¿Tienes dudas o deseas solicitar una cotización personalizada? Nuestro equipo te responderá a la brevedad.</p>
        </div>
        <div className="grid items-start gap-12 md:grid-cols-2">
          <div className="space-y-8">
            <div className="grid items-start gap-6 sm:grid-cols-2">
              <div className="space-y-6">
                <ContactItem icon={<Mail size={24} />} title="Correo Electrónico"><p>admon.servicios@servris.com</p></ContactItem>
                <ContactItem icon={<Phone size={24} />} title="Teléfonos de Atención"><p>+52 (55) 7882-1986</p><p>WhatsApp: +52 (55) 7882-1986</p></ContactItem>
                <ContactItem icon={<MapPin size={24} />} title="Oficinas Corporativas"><p>Río Consulado 49, Jardines de Morelos, 55070 Ecatepec de Morelos, Méx.</p></ContactItem>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-6 shadow-sm">
                <span className="mb-4 block text-xs font-bold tracking-wider text-slate-400 uppercase">Síguenos en nuestras redes</span>
                <div className="flex flex-col gap-3">
                  <SocialLink href="https://linkedin.com" icon={<FaLinkedinIn />} label="LinkedIn" />
                  <SocialLink href="https://www.facebook.com/profile.php?id=100085932893022" icon={<FaFacebookF />} label="Facebook" />
                </div>
              </div>
            </div>
            <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg">
              <iframe title="Ubicación de la Empresa" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3759.5085375429156!2d-99.00335632400977!3d19.595638281720816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ee3adca42653%3A0xf77875c928be8ff9!2sR%C3%ADo%20Consulado%2049%2C%20Jardines%20de%20Morelos%2C%2055070%20Ecatepec%20de%20Morelos%2C%20M%C3%A9x.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx" width="100%" height="100%" style={{ border: 0 }} loading="lazy" className="h-full w-full" />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
            <h3 className="mb-6 text-2xl font-bold">Envíanos un mensaje</h3>
            <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
              <Field label="Nombre completo"><input type="text" placeholder="Tu nombre" className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></Field>
              <Field label="Correo Corporativo"><input type="email" placeholder="correo@empresa.com" className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></Field>
              <Field label="Mensaje"><textarea rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white focus:border-blue-500 focus:outline-none" /></Field>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400">Enviar Mensaje <Send size={18} aria-hidden="true" /></button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactItem({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/20 text-blue-400">{icon}</div><div><h3 className="mb-1 text-lg font-bold">{title}</h3><div className="text-sm text-slate-400">{children}</div></div></div>
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="group flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-slate-300 shadow-md transition-all duration-200 hover:bg-blue-600 hover:text-white"><span className="text-lg text-blue-400 transition-colors group-hover:text-white">{icon}</span><span className="text-sm font-medium">{label}</span></a>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold tracking-wider text-slate-400 uppercase">{label}</span>{children}</label>
}
