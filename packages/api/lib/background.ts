export function runInBackground(work: Promise<unknown>) {
  const scheduled = work.catch((err) => {
    console.error('background task failed', err)
  })
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { waitUntil } = require('@vercel/functions') as { waitUntil?: (task: Promise<unknown>) => void }
    waitUntil?.(scheduled)
  } catch {
    void scheduled
  }
}
