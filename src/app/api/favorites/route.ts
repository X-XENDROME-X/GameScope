import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { favorites, users } from '@/lib/db/schema'
import { authOptions } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { randomUUID } from 'crypto'

// Get user's favorites
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userFavorites = await db.select()
      .from(favorites)
      .innerJoin(users, eq(favorites.userId, users.id))
      .where(eq(users.email, session.user.email))
      .orderBy(favorites.addedAt)

    return NextResponse.json({
      favorites: userFavorites.map(({ favorites: fav }) => ({
        id: fav.id,
        gameId: fav.gameId,
        gameName: fav.gameName,
        gameImage: fav.gameImage,
        gameRating: fav.gameRating,
        gameGenres: fav.gameGenres,
        gamePlatforms: fav.gamePlatforms,
        addedAt: fav.addedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Add to favorites
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { gameId, gameName, gameImage, gameRating, gameGenres, gamePlatforms } = body

    // Validate required fields
    if (!gameId || !gameName) {
      return NextResponse.json({ error: 'Game ID and name are required' }, { status: 400 })
    }

    // Validate data types and sanitize inputs
    if (typeof gameId !== 'string' || typeof gameName !== 'string') {
      return NextResponse.json({ error: 'Invalid data types' }, { status: 400 })
    }

    // Prevent XSS and injection attacks
    const sanitizedGameName = gameName.trim().substring(0, 255)
    const sanitizedGameId = gameId.trim().substring(0, 50)
    
    if (!sanitizedGameName || !sanitizedGameId) {
      return NextResponse.json({ error: 'Invalid game data' }, { status: 400 })
    }

    // Find user
    const user = await db.select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUser = user[0]

    // Check if already in favorites
    const existingFavorite = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, currentUser.id),
        eq(favorites.gameId, sanitizedGameId)
      ))
      .limit(1)

    if (existingFavorite.length > 0) {
      return NextResponse.json({ error: 'Game already in favorites' }, { status: 409 })
    }

    // Check favorites limit (20 per user)
    if (currentUser.favoritesCount >= 20) {
      return NextResponse.json({ 
        error: `Favorites limit reached (${currentUser.favoritesCount}/20). Remove some favorites to add new games to your collection.`
      }, { status: 403 })
    }

    // Double-check with actual database count to prevent race conditions
    const actualFavoritesCount = await db.select()
      .from(favorites)
      .where(eq(favorites.userId, currentUser.id))
    
    if (actualFavoritesCount.length >= 20) {
      // Update user's count in case it's out of sync
      await db.update(users)
        .set({ favoritesCount: actualFavoritesCount.length })
        .where(eq(users.id, currentUser.id))
      
      return NextResponse.json({ 
        error: `Favorites limit reached (${actualFavoritesCount.length}/20). Remove some favorites to add new games to your collection.`
      }, { status: 403 })
    }

    // Add to favorites
    const favoriteId = randomUUID()
    await db.insert(favorites).values({
      id: favoriteId,
      userId: currentUser.id,
      gameId: sanitizedGameId,
      gameName: sanitizedGameName,
      gameImage: gameImage && typeof gameImage === 'string' ? gameImage.substring(0, 500) : null,
      gameRating: gameRating && typeof gameRating === 'number' ? gameRating.toString() : null,
      gameGenres: gameGenres && typeof gameGenres === 'string' ? gameGenres.substring(0, 500) : null,
      gamePlatforms: gamePlatforms && typeof gamePlatforms === 'string' ? gamePlatforms.substring(0, 1000) : null,
      addedAt: new Date()
    })

    // Update user's favorites count
    await db.update(users)
      .set({ favoritesCount: currentUser.favoritesCount + 1 })
      .where(eq(users.id, currentUser.id))

    return NextResponse.json({
      success: true,
      message: 'Game added to favorites',
      favoriteId
    })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Remove from favorites
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const gameId = searchParams.get('gameId')

    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    // Sanitize gameId
    const sanitizedGameId = gameId.trim().substring(0, 50)
    if (!sanitizedGameId) {
      return NextResponse.json({ error: 'Invalid game ID' }, { status: 400 })
    }

    // Find user
    const user = await db.select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1)

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentUser = user[0]

    // Find and delete the favorite
    const existingFavorite = await db.select()
      .from(favorites)
      .where(and(
        eq(favorites.userId, currentUser.id),
        eq(favorites.gameId, sanitizedGameId)
      ))
      .limit(1)

    if (existingFavorite.length === 0) {
      return NextResponse.json({ error: 'Game not in favorites' }, { status: 404 })
    }

    await db.delete(favorites)
      .where(and(
        eq(favorites.userId, currentUser.id),
        eq(favorites.gameId, sanitizedGameId)
      ))

    // Update user's favorites count
    await db.update(users)
      .set({ favoritesCount: Math.max(0, currentUser.favoritesCount - 1) })
      .where(eq(users.id, currentUser.id))

    return NextResponse.json({
      success: true,
      message: 'Game removed from favorites'
    })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
