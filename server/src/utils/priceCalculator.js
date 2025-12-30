/**
 * Service de calcul des prix pour les commandes
 */

/**
 * Calcule le prix d'un menu selon le nombre de convives
 * @param {number} basePrice - Prix de base du menu
 * @param {number} pricePerAdditionalGuest - Prix par convive supplémentaire
 * @param {number} minimumGuests - Nombre minimum de convives
 * @param {number} guests - Nombre de convives demandés
 * @returns {number} Prix du menu
 */
export function calculateMenuPrice(basePrice, pricePerAdditionalGuest, minimumGuests, guests) {
  if (guests < minimumGuests) {
    return basePrice;
  }

  const additionalGuests = guests - minimumGuests;
  const additionalPrice = pricePerAdditionalGuest ? additionalPrice * pricePerAdditionalGuest : 0;

  return basePrice + additionalPrice;
}

/**
 * Calcule la réduction de 10% si 5+ personnes supplémentaires
 * @param {number} menuPrice - Prix du menu calculé
 * @param {number} minimumGuests - Nombre minimum de convives
 * @param {number} guests - Nombre de convives demandés
 * @returns {number} Montant de la réduction
 */
export function calculateDiscount(menuPrice, minimumGuests, guests) {
  const additionalGuests = guests - minimumGuests;
  if (additionalGuests >= 5) {
    return menuPrice * 0.1; // 10% de réduction
  }
  return 0;
}

/**
 * Calcule le prix de livraison
 * @param {string} deliveryAddress - Adresse de livraison
 * @param {number} baseDeliveryPrice - Prix de base (5€)
 * @param {number} pricePerKm - Prix par km (0.59€)
 * @returns {number} Prix de livraison
 */
export function calculateDeliveryPrice(deliveryAddress, baseDeliveryPrice = 5, pricePerKm = 0.59) {
  // Vérifier si l'adresse contient "Bordeaux" ou "33000"
  const isBordeaux = /bordeaux|33000/i.test(deliveryAddress);
  
  if (isBordeaux) {
    return 0; // Gratuit à Bordeaux
  }

  // Estimation basique : on pourrait améliorer avec une API de géolocalisation
  // Pour l'instant, on utilise le prix de base + estimation
  // Dans un vrai projet, on utiliserait une API de distance (Google Maps, etc.)
  
  // Pour simplifier, on retourne le prix de base
  // TODO: Implémenter le calcul réel avec une API de géolocalisation
  return baseDeliveryPrice;
}

/**
 * Calcule le prix total d'une commande
 * @param {Object} params
 * @param {number} params.basePrice - Prix de base du menu
 * @param {number} params.pricePerAdditionalGuest - Prix par convive supplémentaire
 * @param {number} params.minimumGuests - Nombre minimum de convives
 * @param {number} params.guests - Nombre de convives demandés
 * @param {string} params.deliveryAddress - Adresse de livraison
 * @returns {Object} Détails du calcul
 */
export function calculateOrderPrice({ basePrice, pricePerAdditionalGuest, minimumGuests, guests, deliveryAddress }) {
  const menuPrice = calculateMenuPrice(basePrice, pricePerAdditionalGuest, minimumGuests, guests);
  const discountAmount = calculateDiscount(menuPrice, minimumGuests, guests);
  const menuPriceAfterDiscount = menuPrice - discountAmount;
  const deliveryPrice = calculateDeliveryPrice(deliveryAddress);
  const totalPrice = menuPriceAfterDiscount + deliveryPrice;

  return {
    menuPrice,
    discountAmount,
    menuPriceAfterDiscount,
    deliveryPrice,
    totalPrice,
    breakdown: {
      basePrice,
      additionalGuests: Math.max(0, guests - minimumGuests),
      additionalPrice: menuPrice - basePrice,
      discountApplied: discountAmount > 0,
      discountPercentage: discountAmount > 0 ? 10 : 0,
    },
  };
}

