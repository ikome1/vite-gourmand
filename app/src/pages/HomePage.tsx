import Header from '../components/Header'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
