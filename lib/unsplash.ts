export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  // Si ya es un link de CDN directo, lo dejamos pero aseguramos parámetros de calidad
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  // Extraer ID de links tipo unsplash.com/photos/ID o unsplash.com/fotos/ID
  const idRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(idRegex);
  
  let id = '';
  if (match && match[1]) {
    id = match[1];
  } else if (/^[a-zA-Z0-9_-]{11,12}$/.test(url)) {
    id = url;
  } else if (url.includes('-unsplash')) {
    const fileMatch = url.match(/([a-zA-Z0-9_-]+)-unsplash/);
    if (fileMatch) id = fileMatch[1];
  }

  if (id) {
    // IMPORTANTE: Para que el preview de WhatsApp y Dashboard funcione SIEMPRE, 
    // usamos el formato de CDN que no falla.
    return `https://images.unsplash.com/photo-1?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1200&fit=max&ixid=${id}`;
  }

  return url;
};
