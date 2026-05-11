export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  // Limpiar espacios en blanco y posibles comillas
  url = url.trim().replace(/['"]/g, '');

  // Si ya es un link de imágenes de unsplash (cdn)
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  // Regex para links de página (soporta /photos/ y /fotos/ y cualquier subdominio/idioma)
  const pageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const pageMatch = url.match(pageRegex);
  if (pageMatch && pageMatch[1]) {
    const id = pageMatch[1];
    // Usamos el endpoint de descarga pero SIN force=true para evitar que el correo lo bloquee como adjunto
    // Agregamos &fm=jpg para asegurar compatibilidad con clientes de correo
    return `https://unsplash.com/photos/${id}/download?w=1200&fm=jpg`;
  }

  // Regex para nombres de archivo descargados (ej: e4kmTGIQFIw-unsplash.jpg)
  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    const id = fileMatch[1];
    return `https://unsplash.com/photos/${id}/download?w=1200&fm=jpg`;
  }

  // Si es solo un ID de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://unsplash.com/photos/${url}/download?w=1200&fm=jpg`;
  }

  return url;
};
