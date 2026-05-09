const formatImageUrl = (url) => {
  if (!url) return '';
  const unsplashPageRegex = /unsplash\.com\/.*?(?:fotos|photos)\/([a-zA-Z0-9_-]+)/;
  const match = url.match(unsplashPageRegex);
  if (match && match[1]) {
    return `https://images.unsplash.com/photo-${match[1]}?auto=format&fit=crop&q=80&w=1000`;
  }
  const fileRegex = /([a-zA-Z0-9_-]{11})-unsplash/;
  const fileMatch = url.match(fileRegex);
  if (fileMatch && fileMatch[1]) {
    return `https://images.unsplash.com/photo-${fileMatch[1]}?auto=format&fit=crop&q=80&w=1000`;
  }
  return url;
};

const testLink = "https://unsplash.com/es/fotos/e4kmTGIQFIw";
console.log("Original:", testLink);
console.log("Corregido:", formatImageUrl(testLink));
