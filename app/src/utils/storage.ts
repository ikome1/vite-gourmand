export const storageKeys = {
  authToken: 'vite-gourmand:auth-token',
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Erreur lors du chargement du stockage pour ${key}`, error);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Erreur lors de l’enregistrement du stockage pour ${key}`, error);
  }
}

export function removeFromStorage(key: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Erreur lors de la suppression du stockage pour ${key}`, error);
  }
}

