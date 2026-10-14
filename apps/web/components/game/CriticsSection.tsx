import type { ReviewLink } from '@gamertakes/types'

export function CriticsSection({ links }: { links: ReviewLink[] }) {
  if (links.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Critics</h2>
      <ul className="divide-y divide-gray-100">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2.5 text-sm text-gray-700 hover:text-brand-600"
            >
              {link.source}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
