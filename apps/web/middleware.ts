import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { isProtectedPath } from '@/lib/auth-paths'

export { isProtectedPath, protectedPaths } from '@/lib/auth-paths'

export default auth((req) => {
  if (isProtectedPath(req.nextUrl.pathname) && !req.auth) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
