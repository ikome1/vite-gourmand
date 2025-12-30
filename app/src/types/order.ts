export type OrderStatus =
  | 'en_attente'
  | 'accepte'
  | 'en_preparation'
  | 'en_cours_de_livraison'
  | 'livre'
  | 'en_attente_retour_materiel'
  | 'terminee'
  | 'annulee';

export interface Order {
  id: string;
  menuId: string;
  menuTitle: string;
  userId: string;
  guests: number;
  eventDate: string;
  deliveryAddress: string;
  notes?: string;
  status: OrderStatus;
  menuPrice?: number;
  discountAmount?: number;
  deliveryPrice?: number;
  totalPrice?: number;
  equipmentLoan?: boolean;
  createdAt: string;
}

export interface OrderHistoryEntry {
  id: number;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
}

