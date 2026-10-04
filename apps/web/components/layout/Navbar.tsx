'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { BookOpenIcon, LayoutDashboardIcon, UserIcon } from 'lucide-react'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="text-brand-500">▶</span> GamerTakes
        </Link>

        <div className="flex-1 max-w-sm hidden sm:block">
          <input
            type="search"
            placeholder="Search games..."
            className="w-full rounded-full border border-gray-200 px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/games?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`
              }
            }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Link href="/news" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2">
            News
          </Link>
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm"><LayoutDashboardIcon className="h-4 w-4" /></Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" size="sm"><BookOpenIcon className="h-4 w-4" /></Button>
              </Link>
              <Link href={`/users/${session.user.username}`}>
                <Button variant="ghost" size="sm"><UserIcon className="h-4 w-4" /></Button>
              </Link>
              <Button variant="secondary" size="sm" onClick={() => signOut()}>Sign Out</Button>
            </>
          ) : (
            <>
              <Link href="/auth/signin"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/auth/signup"><Button size="sm">Sign Up</Button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
