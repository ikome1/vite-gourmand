import { createContext, useContext, useState, useEffect } from 'react'
import { Menu } from '../types/menu'

interface MenuContextType {
  menus: Menu[]
  loading: boolean
  error: string | null
  fetchMenus: () => Promise<void>
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function useMenuContext() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenuContext must be used within MenuProvider')
  }
  return context
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMenus = async () => {
    setLoading(true)
    try {
      // TODO: Appel API
      setMenus([])
    } catch (err) {
      setError('Erreur lors du chargement des menus')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MenuContext.Provider value={{ menus, loading, error, fetchMenus }}>
      {children}
    </MenuContext.Provider>
  )
}
