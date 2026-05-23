export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  // 1. Si ya es un link de imágenes (CDN) de unsplash, lo usamos tal cual
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // 2. Si es un link de página, intentamos extraer el ID
  // Formato: unsplash.com/photos/ID o unsplash.com/fotos/ID o unsplash.com/es/fotos/SLUG-ID
  const idRegex = /(?:photos|fotos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(idRegex);
  
  if (match && match[1]) {
    let id = match[1];
    // Si contiene guiones, el ID real de Unsplash es la última parte después del último guion
    if (id.includes('-')) {
      const parts = id.split('-');
      const lastPart = parts[parts.length - 1];
      if (lastPart.length >= 8 && lastPart.length <= 15) {
        id = lastPart;
      }
    }
    // Usamos el formato de link de descarga que suele ser más permisivo con CORS en navegadores
    return `https://unsplash.com/photos/${id}/download?w=1200&fm=jpg`;
  }

  // 3. Si pegaron solo el ID o ID con slug
  if (/^[a-zA-Z0-9_-]{11,12}$/.test(url)) {
    return `https://unsplash.com/photos/${url}/download?w=1200&fm=jpg`;
  }

  // Fallback: si no es nada de lo anterior, devolvemos el original
  return url;
};
