export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  // 1. Si ya es un link de imágenes (CDN) de unsplash, lo usamos tal cual
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // 2. Si es un link de página, intentamos extraer el ID
  // Formato: unsplash.com/photos/ID o unsplash.com/fotos/ID
  const idRegex = /(?:photos|fotos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(idRegex);
  
  if (match && match[1]) {
    const id = match[1];
    // Usamos el formato de link de descarga que suele ser más permisivo con CORS en navegadores
    return `https://unsplash.com/photos/${id}/download?w=1200&fm=jpg`;
  }

  // 3. Si pegaron solo el ID
  if (/^[a-zA-Z0-9_-]{11,12}$/.test(url)) {
    return `https://unsplash.com/photos/${url}/download?w=1200&fm=jpg`;
  }

  // Fallback: si no es nada de lo anterior, devolvemos el original
  return url;
};
