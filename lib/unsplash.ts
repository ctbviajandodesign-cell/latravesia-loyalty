/**
 * Formatea una URL de Unsplash a su URL directa del CDN.
 * Uso: cliente (browser-side) — sin fetch, sin scraping.
 *
 * Formatos soportados:
 *   - images.unsplash.com/...        → se usa tal cual
 *   - unsplash.com/photos/ID         → construye CDN URL
 *   - unsplash.com/fotos/slug-ID     → extrae ID y construye CDN URL
 *   - Solo el ID (11-12 chars)       → construye CDN URL
 *   - Cualquier otra URL             → se usa tal cual
 */
export const formatUnsplashUrl = (url: string): string => {
  if (!url) return '';

  url = url.trim().replace(/['"]/g, '');

  // 1. Si ya es un link del CDN de Unsplash, úsalo tal cual
  if (url.includes('images.unsplash.com')) {
    return url;
  }

  // 2. Si es un link de página de Unsplash, extraer el ID del photo
  if (url.includes('unsplash.com')) {
    const pathMatch = url.match(/(?:photos|fotos)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) {
      let segment = pathMatch[1];

      // Si el segmento es un slug con guiones, el ID está al final
      if (segment.includes('-')) {
        const parts = segment.split('-');
        const lastPart = parts[parts.length - 1];
        if (lastPart.length >= 8 && lastPart.length <= 15) {
          segment = lastPart;
        }
      }

      return `https://images.unsplash.com/photo-${segment}?w=1200&q=80&fm=jpg&fit=crop`;
    }
  }

  // 3. Si pegaron solo el ID (11-12 chars alfanuméricos)
  if (/^[a-zA-Z0-9_-]{8,15}$/.test(url)) {
    return `https://images.unsplash.com/photo-${url}?w=1200&q=80&fm=jpg&fit=crop`;
  }

  // Fallback: devolver la URL original
  return url;
};
