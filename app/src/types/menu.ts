export type MenuTheme = 'Noël' | 'Pâques' | 'Classique' | 'Événement' | 'Mariage' | 'Brunch';

export type MenuRegime = 'Classique' | 'Végétarien' | 'Vegan' | 'Sans gluten' | 'Pescetarien';

export type Allergen =
  | 'Gluten'
  | 'Lactose'
  | 'Fruits à coque'
  | 'Crustacés'
  | 'Poisson'
  | 'Œuf'
  | 'Arachide'
  | 'Soja'
  | 'Sésame';

export type CourseType = 'Entrée' | 'Plat' | 'Dessert';

export interface Dish {
  id: string;
  name: string;
  description: string;
  allergens: Allergen[];
  isSignature?: boolean;
}

export interface MenuConditions {
  orderingNotice: string;
  storage: string;
  notes?: string;
}

export interface Menu {
  id: string;
  title: string;
  description: string;
  theme: MenuTheme;
  regime: MenuRegime;
  minimumGuests: number;
  basePrice: number;
  pricePerAdditionalGuest?: number;
  stock: number;
  images: string[];
  conditions: MenuConditions;
  courses?: {
    entrees: Dish[];
    plats: Dish[];
    desserts: Dish[];
  };
  createdAt: string;
  updatedAt: string;
  highlight?: string;
}

export interface MenuFilters {
  maxPrice?: number;
  priceRange?: [number, number];
  theme?: MenuTheme | 'Tous';
  regime?: MenuRegime | 'Tous';
  minimumGuests?: number;
  search?: string;
}

export interface NewMenuInput {
  title: string;
  description: string;
  theme: MenuTheme;
  regime: MenuRegime;
  minimumGuests: number;
  basePrice: number;
  pricePerAdditionalGuest?: number;
  stock?: number;
  highlight?: string;
  images?: string[];
  conditions?: Partial<MenuConditions>;
}

