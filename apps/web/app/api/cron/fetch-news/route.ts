import { NextResponse } from 'next/server'
import { fetchAllNews } from '@/jobs/fetchNews'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await fetchAllNews()
  return NextResponse.json(result)
}
