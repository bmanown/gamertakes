'use client'
import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/Button'

export default function IntegrationsPage() {
  const [steamInput, setSteamInput] = useState('')
  const [psnToken, setPsnToken] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const { data: status, refetch } = trpc.integrations.getIntegrationStatus.useQuery()
  const connectSteam = trpc.integrations.connectSteam.useMutation({
    onSuccess: (d) => { setMessage(`Steam connected! ${d.updated} games imported.`); refetch() },
    onError: (e) => setMessage(`Error: ${e.message}`),
  })
  const syncSteam = trpc.integrations.syncSteam.useMutation({
    onSuccess: (d) => setMessage(`Synced ${d.updated} games from Steam.`),
  })
  const connectPSN = trpc.integrations.connectPSN.useMutation({
    onSuccess: (d) => { setMessage(`PSN connected! ${d.updated} games imported.`); refetch() },
    onError: (e) => setMessage(`Error: ${e.message}`),
  })
  const syncPSN = trpc.integrations.syncPSN.useMutation({
    onSuccess: (d) => setMessage(`Synced ${d.updated} games from PSN.`),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Platform Integrations</h1>
      {message && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      )}

      {/* Steam */}
      <div className="rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Steam</h2>
            <p className="text-sm text-gray-500">Import your Steam library and playtime</p>
          </div>
          {status?.steam && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Connected</span>
          )}
        </div>
        {!status?.steam ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Steam ID (17 digits) or vanity URL"
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400">
              Your Steam profile must be set to Public. Find your Steam ID at steamid.io.
            </p>
            <Button
              onClick={() => connectSteam.mutate({ steamInput })}
              disabled={!steamInput || connectSteam.isPending}
            >
              {connectSteam.isPending ? 'Connecting...' : 'Connect Steam'}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => syncSteam.mutate()} disabled={syncSteam.isPending}>
            {syncSteam.isPending ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}
      </div>

      {/* PSN */}
      <div className="rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">PlayStation Network</h2>
            <p className="text-sm text-gray-500">Import your PS4/PS5 library and playtime</p>
          </div>
          {status?.psn && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Connected</span>
          )}
        </div>
        {!status?.psn ? (
          <div className="space-y-2">
            <input
              type="password"
              placeholder="NPSSO Token"
              value={psnToken}
              onChange={(e) => setPsnToken(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400">
              Get your NPSSO token: sign in to playstation.com, then visit ca.account.sony.com/api/v1/ssocookie
            </p>
            <Button
              onClick={() => connectPSN.mutate({ npssoToken: psnToken })}
              disabled={!psnToken || connectPSN.isPending}
            >
              {connectPSN.isPending ? 'Connecting...' : 'Connect PSN'}
            </Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => syncPSN.mutate()} disabled={syncPSN.isPending}>
            {syncPSN.isPending ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}
      </div>
    </div>
  )
}
