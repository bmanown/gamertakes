import { NextResponse } from 'next/server'
import { fillReviewLinksBatch } from '@/jobs/fillReviewLinks'

export const maxDuration = 300

export async function GET(req: Request) {
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await fillReviewLinksBatch()
  return NextResponse.json(result)
}
