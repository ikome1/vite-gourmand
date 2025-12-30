export interface Menu {
  id: number
  name: string
  description: string
  price: number
  category: string
  image?: string
  available: boolean
  created_at?: string
}

export type MenuCategory = 'Brunch' | 'Noël' | 'Pâques' | 'Vegan' | 'Générique'
