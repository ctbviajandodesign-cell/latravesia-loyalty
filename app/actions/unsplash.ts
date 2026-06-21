'use server';

/**
 * Resuelve una URL de Unsplash a su URL directa del CDN.
 *
 * Estrategia: construir directamente la URL del CDN de images.unsplash.com
 * extrayendo el photo-ID con regex, SIN hacer scraping del HTML.
 *
 * Formatos soportados:
 *   - unsplash.com/photos/AbCdEfGhI12  → photo-AbCdEfGhI12
 *   - unsplash.com/es/fotos/titulo-AbCdEfGhI12
 *   - unsplash.com/fotos/titulo-AbCdEfGhI12
 *   - images.unsplash.com/...  → se usa tal cual
 *   - Cualquier otra URL       → se usa tal cual
 */
export async function resolveUnsplashUrl(url: string): Promise<string> {
  if (!url) return '';

  const cleanUrl = url.trim().replace(/['"]/g, '');

  // 1. Ya es una URL directa del CDN → úsala tal cual
  if (cleanUrl.includes('images.unsplash.com')) {
    return cleanUrl;
  }

  // 2. Es Pexels
  if (cleanUrl.includes('pexels.com')) {
    if (cleanUrl.includes('images.pexels.com')) return cleanUrl;
    
    // Extraer el ID numérico de la URL (ej: /foto/38214562/ o /photo/titulo-38214562)
    const match = cleanUrl.match(/(?:photo|foto)\/(?:.*?[-])?(\d+)\/?(?:$|\?)/i);
    if (match && match[1]) {
      const id = match[1];
      return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1200`;
    }
    return cleanUrl;
  }

  // 3. No es de Unsplash ni Pexels → devolver tal cual
  if (!cleanUrl.includes('unsplash.com')) {
    return cleanUrl;
  }

  // 4. Extraer el photo-ID de la URL de página de Unsplash
  //    El ID es la parte alfanumérica al final del path (después del último "-" en slugs)
  //    Ejemplos:
  //      /photos/e4kmTGIQFIw           → e4kmTGIQFIw
  //      /es/fotos/bosque-e4kmTGIQFIw  → e4kmTGIQFIw
  //      /fotos/e4kmTGIQFIw            → e4kmTGIQFIw
  try {
    const pathMatch = cleanUrl.match(/(?:photos|fotos)\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1]) {
      let segment = pathMatch[1];

      // Si el segmento es un slug con guiones, el ID está al final
      if (segment.includes('-')) {
        const parts = segment.split('-');
        const lastPart = parts[parts.length - 1];
        // Los IDs de Unsplash son 10-12 caracteres alfanuméricos
        if (lastPart.length >= 8 && lastPart.length <= 15) {
          segment = lastPart;
        }
      }

      // Construir URL directa del CDN — no necesita autenticación para imágenes públicas
      return `https://images.unsplash.com/photo-${segment}?w=1200&q=80&fm=jpg&fit=crop`;
    }
  } catch (e) {
    console.error('Error parsing Unsplash URL:', e);
  }

  // Fallback: devolver la URL original
  return cleanUrl;
}
