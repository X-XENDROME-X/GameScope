import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract pagination parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(40, Math.max(1, parseInt(searchParams.get('page_size') || '20')))

    // Get trending games from the last 30 days with high ratings
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const rawgParams = new URLSearchParams({
      dates: `${thirtyDaysAgo.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}`,
      ordering: '-rating',
      page: page.toString(),
      page_size: pageSize.toString()
    })

    // Fetch from RAWG API securely
    const data = await secureApiClient.fetchRAWG(`games?${rawgParams}`)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' // Cache trending for 5 minutes
      }
    })
  } catch (error) {
    console.error('Trending games API error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch trending games', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(handler)
