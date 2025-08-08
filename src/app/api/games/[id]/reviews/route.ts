import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract game ID from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const gameId = pathParts[pathParts.length - 2] // reviews is the last part, so game ID is second to last

    // Validate game ID
    if (!gameId || isNaN(Number(gameId))) {
      return NextResponse.json(
        { error: 'Invalid game ID provided', code: 'INVALID_GAME_ID' },
        { status: 400 }
      )
    }

    // Extract pagination parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(20, Math.max(1, parseInt(searchParams.get('page_size') || '5')))

    // Build RAWG reviews endpoint
    const rawgParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })

    // Fetch from RAWG API securely
    const data = await secureApiClient.fetchRAWG(`games/${gameId}/reviews?${rawgParams}`)
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600' // Cache reviews for 30min
      }
    })
  } catch (error) {
    console.error('Game Reviews API error:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch game reviews', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(handler)
