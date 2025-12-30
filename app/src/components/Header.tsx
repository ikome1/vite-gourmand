import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Vite & Gourmand
        </Link>
        <nav className={isMenuOpen ? 'nav-open' : ''}>
          <Link to="/">Accueil</Link>
          <Link to="/menus">Menus</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          ☰
        </button>
      </div>
    </header>
  )
}
