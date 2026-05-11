export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  // Limpiar espacios en blanco y posibles comillas
  url = url.trim().replace(/['"]/g, '');

  // Si ya es un link directo de descarga de unsplash
  if (url.includes('unsplash.com/photos/') && url.includes('/download')) {
    return url;
  }

  // Si ya es un link de imágenes de unsplash (cdn)
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  // Regex para links de página (soporta /photos/ y /fotos/ y cualquier subdominio/idioma)
  // Captura el ID que viene después de fotos/ o photos/
  const pageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const pageMatch = url.match(pageRegex);
  if (pageMatch && pageMatch[1]) {
    return `https://unsplash.com/photos/${pageMatch[1]}/download?force=true&w=1200`;
  }

  // Regex para nombres de archivo descargados (ej: e4kmTGIQFIw-unsplash.jpg)
  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    return `https://unsplash.com/photos/${fileMatch[1]}/download?force=true&w=1200`;
  }

  // Si es solo un ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://unsplash.com/photos/${url}/download?force=true&w=1200`;
  }

  return url;
};
