/**
 * Utilitaires pour le calcul des prix côté frontend
 */

export interface PriceCalculationResult {
  menuPrice: number;
  discountAmount: number;
  menuPriceAfterDiscount: number;
  deliveryPrice: number;
  totalPrice: number;
  breakdown: {
    basePrice: number;
    additionalGuests: number;
    additionalPrice: number;
    discountApplied: boolean;
    discountPercentage: number;
  };
}

/**
 * Calcule le prix d'une commande côté frontend (pour prévisualisation)
 */
export function calculateOrderPricePreview(
  basePrice: number,
  pricePerAdditionalGuest: number,
  minimumGuests: number,
  guests: number,
  deliveryAddress: string
): PriceCalculationResult {
  // Calcul du prix de base + convives supplémentaires
  const additionalGuests = Math.max(0, guests - minimumGuests);
  const additionalPrice = pricePerAdditionalGuest ? additionalGuests * pricePerAdditionalGuest : 0;
  const menuPrice = basePrice + additionalPrice;

  // Réduction de 10% si 5+ personnes supplémentaires
  const discountAmount = additionalGuests >= 5 ? menuPrice * 0.1 : 0;
  const menuPriceAfterDiscount = menuPrice - discountAmount;

  // Calcul livraison (gratuit à Bordeaux)
  const isBordeaux = /bordeaux|33000/i.test(deliveryAddress);
  const deliveryPrice = isBordeaux ? 0 : 5; // TODO: Calculer avec distance réelle

  const totalPrice = menuPriceAfterDiscount + deliveryPrice;

  return {
    menuPrice,
    discountAmount,
    menuPriceAfterDiscount,
    deliveryPrice,
    totalPrice,
    breakdown: {
      basePrice,
      additionalGuests,
      additionalPrice,
      discountApplied: discountAmount > 0,
      discountPercentage: discountAmount > 0 ? 10 : 0,
    },
  };
}

