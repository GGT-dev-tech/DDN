import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const DEFAULT_BACKEND_URL = 'https://backend-production-946f.up.railway.app'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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

// Match all routes except static assets and API routes
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
