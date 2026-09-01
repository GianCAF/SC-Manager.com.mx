import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const heroImages = [
  '/imagenes/imagen2.png',
  '/imagenes/imagen.png',
  '/imagenes/imagen3.png',
  '/imagenes/imagen4.png',
]

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % heroImages.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section id="inicio" aria-label="Presentación" className="relative flex h-[85vh] min-h-[500px] w-full items-center justify-center overflow-hidden bg-slate-950 text-white">
      {heroImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          fetchPriority={index === 0 ? 'high' : 'auto'}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 z-10 bg-slate-950/70" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-6 bg-slate-900/50 px-4 text-center backdrop-blur-[2px]">
        <div className="max-w-4xl space-y-2">
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-6xl">
            Tu aliado en confianza y capital humano.
          </h1>
          <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-blue-400 drop-shadow-md md:text-5xl lg:text-6xl">
            Investigación con rigor.
          </h2>
        </div>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed font-medium text-slate-200 drop-shadow md:text-base">
          Soluciones profesionales en estudios socioeconómicos, investigaciones laborales y validación de información para empresas.
        </p>
        <div className="flex justify-center pt-4">
          <Link to="/auth/login" className="group inline-flex items-center justify-center gap-3 rounded-full bg-blue-600 px-9 py-3.5 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <span>Acceder al Sistema</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
