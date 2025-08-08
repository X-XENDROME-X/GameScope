import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract game ID from URL
    const pathParts = new URL(request.url).pathname.split('/')
    const gameId = pathParts[pathParts.length - 1]

    // Validate game ID
    if (!secureApiClient.validateGameId(gameId)) {
      return NextResponse.json(
        { error: 'Invalid game ID', code: 'INVALID_ID' },
        { status: 400 }
      )
    }

    // Fetch game details from RAWG API
    const gameData = await secureApiClient.fetchRAWG(`games/${gameId}`)
    
    return NextResponse.json(gameData, {
      headers: {
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1200'
      }
    })
    
  } catch (error) {
    console.error('Game details API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch game details', 
        code: 'FETCH_FAILED' 
      },
      { status: 500 }
    )
  }
}

// Export with security middleware  
export const GET = withSecurity(handler)
