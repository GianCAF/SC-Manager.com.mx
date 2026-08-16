export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-8 text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs md:flex-row">
        <p>© 2026 SocioManager. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <a href="#inicio" className="transition-colors hover:text-slate-300">Privacidad</a>
          <a href="#inicio" className="transition-colors hover:text-slate-300">Términos</a>
          <a href="#contacto" className="transition-colors hover:text-slate-300">Contacto</a>
        </div>
      </div>
    </footer>
  )
}
