import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-gray-500">Account, privacy, and platform connections.</p>
      <Link
        href="/settings/integrations"
        className="block rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:bg-brand-50/40"
      >
        <h2 className="font-semibold text-lg">Platform Integrations</h2>
        <p className="text-sm text-gray-500 mt-1">Connect Steam and PlayStation Network to import playtime.</p>
      </Link>
    </div>
  )
}
