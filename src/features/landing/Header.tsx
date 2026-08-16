import { Link } from 'react-router-dom'

const navigation = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white px-4 py-2 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <a href="#inicio" aria-label="Ir al inicio" className="flex shrink-0 items-center">
          <img src="/imagenes/logo1.png" alt="Logo SocioManager" className="h-9 w-auto object-contain" />
        </a>

        <nav aria-label="Navegación principal" className="hidden items-center text-sm font-bold lg:flex lg:gap-2 xl:gap-6">
          {navigation.map((item) => (
            <a key={item.label} href={item.href} className="rounded-md bg-blue-600 px-5 py-2.5 text-center text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:px-7">
              {item.label}
            </a>
          ))}
        </nav>

        <Link to="/auth/login" className="block shrink-0 rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-7">
          Iniciar Sesión
        </Link>
      </div>
    </header>
  )
}
