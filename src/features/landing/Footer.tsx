import { useCallback, useState } from 'react'
import { ArrowRight, FileText, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa'
import { ContactModal } from './ContactModal'

export function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const closeContactModal = useCallback(() => setIsContactModalOpen(false), [])

  return (
    <>
      <footer id="contacto" className="border-t border-blue-400/20 bg-[#020d22] text-slate-200">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-700/70 px-4 md:grid-cols-2 md:divide-y-0 xl:grid-cols-[1.25fr_1.25fr_1fr_1fr_1fr] xl:px-8">
          <FooterItem icon={<MapPin size={25} strokeWidth={1.5} />} title="Dirección">
            <address className="mt-1 text-xs leading-relaxed text-slate-400 not-italic">
              Av. Reforma 1234, Col. Centro,<br />Pachuca de Soto, Hidalgo, C.P. 42000
            </address>
          </FooterItem>

          <FooterItem icon={<Mail size={25} strokeWidth={1.5} />} title="Formulario de contacto">
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="group mt-2 inline-flex items-center gap-2 text-left text-xs font-medium text-blue-400 transition-colors hover:text-blue-300 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
            >
              Completa nuestro formulario
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </FooterItem>

          <FooterItem title="Redes sociales">
            <div className="mt-3 flex items-center gap-3">
              <SocialLink href="https://linkedin.com" label="LinkedIn"><FaLinkedinIn /></SocialLink>
              <SocialLink href="https://www.facebook.com/profile.php?id=100085932893022" label="Facebook"><FaFacebookF /></SocialLink>
              <SocialLink href="https://instagram.com" label="Instagram"><FaInstagram /></SocialLink>
              <SocialLink href="https://wa.me/525578821986" label="WhatsApp"><FaWhatsapp /></SocialLink>
            </div>
          </FooterItem>

          <FooterItem icon={<ShieldCheck size={25} strokeWidth={1.5} />} title="Avisos de privacidad">
            <button type="button" className="mt-3 h-0.5 w-12 bg-blue-500" aria-label="Avisos de privacidad, próximamente" />
          </FooterItem>

          <FooterItem icon={<FileText size={25} strokeWidth={1.5} />} title="Términos y condiciones">
            <button type="button" className="mt-3 h-0.5 w-12 bg-blue-500" aria-label="Términos y condiciones, próximamente" />
          </FooterItem>
        </div>

        <div className="border-t border-slate-800/80 px-4 py-4 text-center text-[11px] text-slate-500">
          © 2026 SocioManager. Todos los derechos reservados.
        </div>
      </footer>

      <ContactModal isOpen={isContactModalOpen} onClose={closeContactModal} />
    </>
  )
}

function FooterItem({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-32 gap-4 px-3 py-7 md:px-6 xl:min-h-36 xl:border-r xl:border-slate-700/70 xl:last:border-r-0">
      {icon && <div className="mt-0.5 shrink-0 text-blue-300">{icon}</div>}
      <div>
        <h2 className="text-xs font-bold text-slate-100">{title}</h2>
        {children}
      </div>
    </div>
  )
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-600 text-sm text-slate-200 transition-all hover:border-blue-400 hover:bg-blue-500/15 hover:text-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      {children}
    </a>
  )
}
