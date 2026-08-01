import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEFAULT_BACKEND_URL = 'https://backend-production-946f.up.railway.app'

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Dynamic runtime proxy for API routes
  if (pathname.startsWith('/api')) {
    const backendHost = process.env.BACKEND_URL || DEFAULT_BACKEND_URL
    const targetUrl = new URL(`${pathname}${search}`, backendHost)
    return NextResponse.rewrite(targetUrl)
  }

  const token = request.cookies.get('access_token')?.value
  const isLoginPage = pathname === '/login'

  // If there's no token and user is trying to access a protected route
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there is a token and user is trying to access the login page
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Match API routes and protected page routes
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
