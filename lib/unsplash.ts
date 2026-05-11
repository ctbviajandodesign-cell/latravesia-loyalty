export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  // Si ya es un link de imágenes (CDN) de unsplash, lo usamos tal cual
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  // Extraer ID de links tipo unsplash.com/photos/ID o unsplash.com/fotos/ID
  const idRegex = /(?:photos|fotos)\/([a-zA-Z0-9_-]+)/;
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
    // Formato DIRECTO con el ID en el path. Esto asegura que cargue la imagen correcta.
    // Si el ID es e4kmTGIQFIw, el link será https://images.unsplash.com/photo-e4kmTGIQFIw?...
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
  }

  return url;
};
