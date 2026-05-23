'use server';

/**
 * Resuelve una URL de página de Unsplash (ej. unsplash.com/es/fotos/e4kmTGIQFIw)
 * a su URL de imagen directa en el CDN (images.unsplash.com/...)
 */
export async function resolveUnsplashUrl(url: string): Promise<string> {
  if (!url) return '';
  
  const cleanUrl = url.trim().replace(/['"]/g, '');
  
  if (cleanUrl.includes('images.unsplash.com')) {
    return cleanUrl;
  }

  if (!cleanUrl.includes('unsplash.com')) {
    return cleanUrl;
  }

  try {
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 3600 } // Cachear por una hora en Next.js
    });

    if (!res.ok) {
      console.warn(`Unsplash fetch returned status ${res.status}`);
      return cleanUrl;
    }

    const html = await res.text();
    
    // Buscar meta og:image o twitter:image
    const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || 
                    html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);
                    
    if (ogMatch && ogMatch[1]) {
      return ogMatch[1];
    }
  } catch (e) {
    console.error('Error resolving Unsplash URL on server:', e);
  }

  return cleanUrl;
}
