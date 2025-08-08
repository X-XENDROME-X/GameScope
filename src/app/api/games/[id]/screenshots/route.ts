import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract game ID from the URL path
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const gameId = pathParts[pathParts.length - 2] // screenshots is the last part, so ID is second to last

    // Validate game ID
    if (!secureApiClient.validateGameId(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Extract pagination parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(40, Math.max(1, parseInt(searchParams.get('page_size') || '20')))

    // Build RAWG screenshots endpoint
    const rawgParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })

    // Fetch from RAWG API securely
    const data = await secureApiClient.fetchRAWG(`games/${gameId}/screenshots?${rawgParams}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Game screenshots API error:', error)
    
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: 'Game not found', code: 'GAME_NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch game screenshots', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

export const GET = withSecurity(handler)
