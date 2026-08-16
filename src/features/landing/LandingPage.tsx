import { CompaniesSection } from './CompaniesSection'
import { Footer } from './Footer'
import { Header } from './Header'
import { Hero } from './Hero'
import { IdentitySection } from './IdentitySection'
import { LocationSection } from './LocationSection'
import { ServicesSection } from './ServicesSection'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-grow">
        <Hero />
        <IdentitySection />
        <ServicesSection />
        <CompaniesSection />
        <LocationSection />
      </main>
      <Footer />
    </div>
  )
}
