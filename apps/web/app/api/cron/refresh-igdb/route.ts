import { NextResponse } from 'next/server'
import { refreshIGDBMetadata } from '@/jobs/refreshIGDB'

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await refreshIGDBMetadata()
  return NextResponse.json(result)
}
