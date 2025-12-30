import { useState, useEffect } from 'react'
import MenuCard from '../components/MenuCard'
import MenuFilters from '../components/MenuFilters'
import { Menu } from '../types/menu'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([])
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous')

  useEffect(() => {
    // TODO: Charger les menus depuis l'API
    setMenus([])
    setFilteredMenus([])
  }, [])

  useEffect(() => {
    if (selectedCategory === 'Tous') {
      setFilteredMenus(menus)
    } else {
      setFilteredMenus(menus.filter(m => m.category === selectedCategory))
    }
  }, [selectedCategory, menus])

  return (
    <div>
      <Header />
      <main className="menus-page">
        <h1>Nos Menus</h1>
        <MenuFilters onFilterChange={setSelectedCategory} />
        <div className="menus-grid">
          {filteredMenus.map(menu => (
            <MenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
