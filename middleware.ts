import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Solo protegemos las rutas que empiezan con /admin/dashboard
  if (path.startsWith('/admin/dashboard')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    const session = await verifySession(sessionCookie);

    if (!session || session.role !== 'admin') {
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
