export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  // Limpiar espacios en blanco
  url = url.trim();

  // Si ya es un link de imágenes de unsplash
  if (url.includes('images.unsplash.com')) {
    // Si no tiene parámetros, le agregamos optimización básica
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  // Regex para links de página (soporta /photos/ y /fotos/ y cualquier subdominio/idioma)
  const pageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const pageMatch = url.match(pageRegex);
  if (pageMatch && pageMatch[1]) {
    return `https://images.unsplash.com/photo-${pageMatch[1]}?auto=format&fit=crop&w=1200&q=80`;
  }

  // Regex para nombres de archivo descargados (ej: e4kmTGIQFIw-unsplash.jpg)
  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    return `https://images.unsplash.com/photo-${fileMatch[1]}?auto=format&fit=crop&w=1200&q=80`;
  }

  // Si es solo un ID (longitud común de IDs de Unsplash es ~11 caracteres)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://images.unsplash.com/photo-${url}?auto=format&fit=crop&w=1200&q=80`;
  }

  return url;
};
