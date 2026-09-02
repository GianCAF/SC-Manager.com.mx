import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { Link } from 'react-router-dom'

const navigation = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'contacto', label: 'Contacto' },
]

const sectionOrder = ['inicio', 'nosotros', 'servicios', 'contacto']

export function Header() {
  const [activeSection, setActiveSection] = useState('inicio')

  useEffect(() => {
    let frameId = 0

    const updateActiveSection = () => {
      const viewportMarker = window.scrollY + window.innerHeight * 0.34
      const isAtBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4

      if (isAtBottom) {
        setActiveSection('contacto')
        return
      }

      const currentSection = sectionOrder.reduce((current, sectionId) => {
        const section = document.getElementById(sectionId)
        return section && section.offsetTop <= viewportMarker ? sectionId : current
      }, 'inicio')

      setActiveSection(currentSection)
    }

    const handleScroll = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <header className="site-header sticky top-0 z-50 h-12 px-4 md:px-8">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4">
        <a href="#inicio" aria-label="Ir al inicio" className="flex w-fit items-center" onClick={() => setActiveSection('inicio')}>
          <img src="/imagenes/Logo4.png" alt="Logo SocioManager" className="h-11.5 w-auto object-contain" />
        </a>

        <nav aria-label="Navegación principal" className="hidden h-full items-center gap-7 text-sm font-medium md:flex lg:gap-10">
          {navigation.map((item) => {
            const isActive = activeSection === item.id

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive}
                className="site-nav-link flex h-full items-center px-1"
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <Link to="/auth/login" className="login-outline justify-self-end" aria-label="Iniciar sesión">
          <span className="relative z-10 flex items-center gap-2 px-4 py-1.5 text-[13px] font-medium text-slate-100 sm:px-5">
            <User size={15} strokeWidth={1.7} aria-hidden="true" />
            Iniciar sesión
          </span>
        </Link>
      </div>
    </header>
  )
}
