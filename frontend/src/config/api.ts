// Configuration de l'API selon l'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getApiUrl = (path: string): string => {
  // En développement, les URLs relatives sont gérées par le proxy Vite
  // En production, on utilise l'URL complète du backend
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path}`;
  }
  return path;
};

export const getImageUrl = (imageUrl: string): string => {
  // Si l'URL est déjà complète (commence par http), la retourner telle quelle
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  // Sinon, préfixer avec l'URL de l'API
  if (API_BASE_URL) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  return imageUrl;
};

export default API_BASE_URL;
