export const formatUnsplashUrl = (url: string) => {
  if (!url) return '';
  
  url = url.trim().replace(/['"]/g, '');

  if (url.includes('images.unsplash.com')) {
    if (!url.includes('?')) {
      return `${url}?auto=format&fit=crop&w=1200&q=80`;
    }
    return url;
  }

  const pageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const pageMatch = url.match(pageRegex);
  if (pageMatch && pageMatch[1]) {
    const id = pageMatch[1];
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
  }

  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    const id = fileMatch[1];
    return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return `https://images.unsplash.com/photo-${url}?auto=format&fit=crop&w=1200&q=80`;
  }

  return url;
};
