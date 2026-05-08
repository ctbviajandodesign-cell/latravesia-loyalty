import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Solo protegemos las rutas que empiezan con /admin/dashboard
  if (path.startsWith('/admin/dashboard')) {
    const session = request.cookies.get('admin_session');

    if (!session || session.value !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
