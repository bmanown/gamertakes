import { NextResponse } from 'next/server'
import { computePopularGames } from '@/jobs/computePopular'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await computePopularGames()
  return NextResponse.json(result)
}
