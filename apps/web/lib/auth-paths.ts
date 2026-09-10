export const protectedPaths = [
  '/dashboard',
  '/library',
  '/profile',
  '/lists/new',
  '/settings',
  '/activity',
]

export function isProtectedPath(pathname: string) {
  return protectedPaths.some((path) => pathname.startsWith(path))
}
