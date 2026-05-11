export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  // Si ya es un link de imágenes (CDN) de unsplash, lo usamos tal cual
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // Si es un link de página, intentamos extraer el ID y convertirlo a link de imagen directo
  // Formato: unsplash.com/photos/ID o unsplash.com/fotos/ID
  const idRegex = /(?:photos|fotos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(idRegex);
  
  if (match && match[1]) {
    const id = match[1];
    // Formato de imagen directo más compatible
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
  }

  // Si pegaron solo el ID
  if (/^[a-zA-Z0-9_-]{11,12}$/.test(url)) {
    return `https://images.unsplash.com/photo-${url}?auto=format&fit=crop&w=1200&q=80`;
  }

  // Fallback: si no es nada de lo anterior, devolvemos el original
  return url;
};
