'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Calendar, ExternalLink, Users } from 'lucide-react'
import { Game } from '@/types/game'
import { formatRating, cn, getMetacriticDotColor, getMetacriticTextOnDark } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/ui/platform-icons'
import { PlatformUtils } from '@/lib/platform-utils'
import { SearchHighlight } from '@/components/game/search-enhancements'
import { FavoriteButton } from '@/components/ui/favorite-button'

interface GameCardProps {
  game: Game
  onClick?: (game: Game) => void
  searchQuery?: string
}

export function GameCard({ game, onClick, searchQuery }: GameCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleCardClick = () => {
    onClick?.(game)
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        )
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300 dark:text-gray-600" />
        )
      }
    }
    return stars
  }

  // Get specific descriptions for popular games
  const getSpecificGameDescription = (gameName: string) => {
    const specificDescriptions: { [key: string]: string } = {
      // Rockstar Games
      'Grand Theft Auto V': 'Experience the epic crime saga in Los Santos with three playable protagonists in this open-world masterpiece filled with heists, drama, and endless possibilities.',
      'Grand Theft Auto: San Andreas': 'Follow CJ\'s journey through the gang-ridden streets of San Andreas in this iconic open-world crime epic that defined a generation.',
      'Red Dead Redemption 2': 'Live the outlaw life in this stunning western epic with unparalleled attention to detail, emotional storytelling, and breathtaking frontier landscapes.',
      'Red Dead Redemption': 'Experience the twilight of the Wild West as John Marston in this revolutionary western adventure that redefined open-world storytelling.',
      
      // CD Projekt RED
      'The Witcher 3: Wild Hunt': 'Follow Geralt of Rivia on his final adventure in this critically acclaimed fantasy RPG with meaningful choices, monster hunting, and a rich, immersive world.',
      'Cyberpunk 2077': 'Enter the neon-soaked streets of Night City in this ambitious cyberpunk RPG featuring cutting-edge technology, corporate warfare, and cybernetic enhancement.',
      'The Witcher 2: Assassins of Kings': 'Continue Geralt\'s saga in this mature fantasy RPG with complex political intrigue, moral choices, and consequences that shape the world.',
      
      // Valve Corporation
      'Portal': 'Solve mind-bending puzzles using portal technology in this innovative first-person puzzle-platform game that revolutionized gaming with its unique mechanics and dark humor.',
      'Portal 2': 'Return to Aperture Science for more challenging puzzles and dark humor in this award-winning sequel featuring co-op gameplay and expanded storytelling.',
      'Counter-Strike: Global Offensive': 'Compete in tactical team-based combat in the world\'s most popular competitive FPS game with precise gunplay and strategic depth.',
      'Counter-Strike 2': 'Experience the next evolution of tactical FPS gaming with updated graphics, improved mechanics, and competitive multiplayer action.',
      'Left 4 Dead 2': 'Survive the zombie apocalypse with friends in this cooperative first-person shooter featuring intense action and teamwork-based gameplay.',
      'Team Fortress 2': 'Join the eternal battle in this team-based multiplayer shooter known for its unique character classes, humor, and distinctive art style.',
      'Half-Life': 'Experience the groundbreaking sci-fi adventure that redefined single-player gaming with Gordon Freeman at the Black Mesa research facility.',
      'Half-Life 2': 'Continue Gordon Freeman\'s fight against the Combine in this revolutionary FPS that showcased advanced physics and emotional storytelling.',
      'Dota 2': 'Master the ultimate MOBA experience with complex strategies, hundreds of heroes, and competitive gameplay that defines the esports scene.',
      
      // Square Enix
      'Tomb Raider': 'Join Lara Croft on her origin story as she transforms from survivor to legendary tomb raider in this action-packed adventure reboot.',
      'Final Fantasy VII': 'Experience the legendary JRPG that captivated millions with Cloud Strife\'s journey, unforgettable characters, and epic storytelling.',
      'Final Fantasy XIV': 'Embark on epic adventures in this acclaimed MMORPG featuring rich storytelling, diverse classes, and a vibrant online community.',
      
      // Bethesda Game Studios
      'The Elder Scrolls V: Skyrim': 'Become the Dragonborn in this epic fantasy RPG with limitless exploration, dragon battles, and countless adventures across Tamriel.',
      'Fallout 4': 'Survive the post-apocalyptic wasteland in this open-world RPG featuring settlement building, companion relationships, and moral choices.',
      'Fallout: New Vegas': 'Navigate the politics of the Mojave Wasteland in this choice-driven RPG that showcases the consequences of every decision.',
      
      // Activision
      'Call of Duty: Modern Warfare': 'Experience intense modern combat in this flagship military FPS featuring cinematic campaigns and competitive multiplayer.',
      'Call of Duty: Warzone': 'Drop into the ultimate battle royale experience with up to 150 players, vehicles, and constantly evolving gameplay.',
      
      // Nintendo
      'The Legend of Zelda: Breath of the Wild': 'Explore the vast kingdom of Hyrule in this revolutionary open-world adventure that redefined the Zelda formula.',
      'Super Mario Odyssey': 'Join Mario on a globe-trotting adventure with his new ally Cappy in this creative 3D platformer filled with surprises.',
      
      // Sony Interactive
      'The Last of Us': 'Experience the emotional journey of Joel and Ellie in this post-apocalyptic masterpiece that redefined narrative in gaming.',
      'God of War': 'Follow Kratos and Atreus on their Norse mythology adventure in this stunning action-adventure that reinvented the franchise.',
      'Spider-Man': 'Swing through New York City as the friendly neighborhood Spider-Man in this exhilarating superhero adventure.',
      
      // EA Games
      'FIFA 23': 'Experience the world\'s most popular sport with authentic teams, players, and stadiums in this annual football simulation.',
      'Battlefield 1': 'Fight in the trenches of World War I in this atmospheric FPS featuring large-scale battles and historical authenticity.',
      
      // Ubisoft
      'Assassin\'s Creed Valhalla': 'Raid and conquer as a fierce Viking warrior in this epic historical adventure set in medieval England.',
      'Far Cry 5': 'Fight against a dangerous cult in the American frontier in this open-world FPS featuring co-op gameplay and chaotic action.',
      
      // Indie Masterpieces
      'Among Us': 'Discover the impostor in this social deduction game that became a global phenomenon with its simple yet addictive gameplay.',
      'Fall Guys': 'Compete in colorful battle royale mayhem with adorable bean characters in this family-friendly multiplayer party game.',
      'Minecraft': 'Build, explore, and survive in this infinite world of blocks that sparked creativity in millions of players worldwide.',
      'Stardew Valley': 'Escape to the countryside and build your dream farm in this charming simulation that captured hearts globally.',
      'Hollow Knight': 'Explore the hauntingly beautiful insect kingdom in this challenging Metroidvania with precise combat and atmospheric storytelling.',
    }
    
    return specificDescriptions[gameName] || null
  }

  // Enhanced description generator with comprehensive genre coverage
  const generateGameDescription = () => {
    // If description_raw is available (from individual game fetch), use it
    if (game.description_raw && game.description_raw.trim()) {
      return game.description_raw.trim()
    }

    // Check for specific game descriptions first
    const specificDesc = getSpecificGameDescription(game.name)
    if (specificDesc) {
      return specificDesc
    }

    // Generate dynamic description based on available game data
    const primaryGenre = game.genres[0]?.name || 'Gaming'
    const secondaryGenre = game.genres[1]?.name
    const releaseYear = new Date(game.released).getFullYear()
    const platforms = game.platforms.length
    const rating = game.rating

    // Comprehensive genre-specific descriptions
    const genreDescriptions = {
      // Core Action Genres
      'Action': `Experience heart-pounding action with intense combat, spectacular set pieces, and adrenaline-fueled gameplay that keeps you at the edge of your seat.`,
      'Adventure': `Embark on an epic quest filled with exploration, puzzle-solving, and unforgettable journeys through richly crafted worlds waiting to be discovered.`,
      'Action-Adventure': `Combine thrilling action sequences with deep exploration in this perfect blend of combat, story, and adventure elements.`,
      
      // RPG Categories
      'RPG': `Immerse yourself in a deep role-playing experience featuring character progression, meaningful choices, and epic storylines that adapt to your decisions.`,
      'JRPG': `Experience classic Japanese role-playing tradition with turn-based combat, compelling characters, and emotionally rich storytelling that spans epic adventures.`,
      'Action RPG': `Blend real-time combat with RPG depth, featuring character customization, skill trees, and dynamic battles in immersive fantasy worlds.`,
      'MMORPG': `Join thousands of players in persistent online worlds featuring raids, guilds, and endless adventures in ever-evolving virtual universes.`,
      
      // Strategy & Simulation
      'Strategy': `Master the art of tactical warfare and resource management in this cerebral experience that rewards strategic thinking and careful planning.`,
      'Real Time Strategy (RTS)': `Command armies in real-time battles where quick thinking and strategic prowess determine victory in epic large-scale conflicts.`,
      'Turn-Based Strategy (TBS)': `Plan your moves carefully in this methodical strategy experience where every decision shapes the outcome of complex tactical scenarios.`,
      'Grand Strategy': `Control entire civilizations across centuries in this deep strategic experience featuring diplomacy, economics, and historical progression.`,
      'Tower Defense': `Strategically place defenses to stop waves of enemies in this addictive genre that combines strategy with satisfying tactical gameplay.`,
      'City Builder': `Design and manage thriving metropolises, balancing resources, population needs, and urban planning in detailed simulation environments.`,
      'Simulation': `Experience authentic real-world scenarios with detailed mechanics and realistic systems that recreate complex activities and professions.`,
      'Life Simulation': `Live virtual lives with relationship building, career progression, and daily activities in charming life management experiences.`,
      'Business Simulation': `Build commercial empires by managing resources, markets, and business strategies in detailed economic simulation environments.`,
      'Vehicle Simulation': `Master realistic vehicle operations with authentic controls and physics in professional-grade simulation experiences.`,
      
      // Shooting & Combat
      'Shooter': `Engage in intense firefights with precision aiming, tactical positioning, and weapon mastery in competitive or cooperative combat scenarios.`,
      'First-Person Shooter': `Experience combat from a first-person perspective with immersive gunplay, tactical awareness, and split-second decision making.`,
      'Third-Person Shooter': `Take cover and engage enemies with over-the-shoulder perspective gameplay combining shooting mechanics with tactical movement.`,
      'Battle Royale': `Fight for survival as the last player standing in large-scale competitive matches with shrinking play areas and strategic gameplay.`,
      'Hero Shooter': `Master unique characters with special abilities in team-based combat that emphasizes cooperation and individual skill expression.`,
      'Tactical Shooter': `Engage in realistic military operations requiring teamwork, communication, and strategic thinking in high-stakes combat scenarios.`,
      
      // Sports & Racing
      'Sports': `Experience authentic athletic competition with realistic gameplay mechanics, official teams, and the thrill of professional sports.`,
      'Football': `Feel the excitement of the beautiful game with authentic teams, stadiums, and gameplay that captures the essence of football.`,
      'Basketball': `Hit the court with realistic basketball action featuring official teams, players, and the strategic depth of professional basketball.`,
      'Racing': `Feel the rush of high-speed competition with realistic physics, stunning tracks, and the pure adrenaline of motorsport racing.`,
      'Arcade Racing': `Enjoy fast-paced racing fun with accessibility and excitement that prioritizes entertainment over strict realism.`,
      'Simulation Racing': `Master authentic driving physics and real-world racing techniques in professional-grade motorsport simulation.`,
      'Kart Racing': `Race with colorful characters and power-ups in family-friendly competition that emphasizes fun over realism.`,
      
      // Platform & Puzzle
      'Platformer': `Navigate challenging obstacle courses with precise jumping mechanics, creative level design, and skillful movement mastery.`,
      '2D Platformer': `Experience classic side-scrolling action with pixel-perfect controls and creative level design that tests your platforming skills.`,
      '3D Platformer': `Explore three-dimensional worlds with inventive gameplay mechanics, collectibles, and creative challenges around every corner.`,
      'Puzzle': `Challenge your intellect with brain-teasing conundrums that require logic, pattern recognition, and creative problem-solving skills.`,
      'Puzzle-Platformer': `Combine thoughtful puzzle-solving with precise platforming mechanics in cleverly designed challenges that test both mind and reflexes.`,
      'Logic Puzzle': `Exercise your reasoning abilities with complex logical challenges that reward analytical thinking and systematic problem-solving.`,
      'Match-3': `Enjoy satisfying tile-matching gameplay with cascading combos and strategic thinking in colorful, addictive puzzle experiences.`,
      
      // Horror & Thriller
      'Horror': `Experience spine-chilling terror with atmospheric tension, psychological scares, and moments that will haunt your nightmares.`,
      'Survival Horror': `Fight for your life against terrifying threats with limited resources in atmospheric experiences designed to terrify and challenge.`,
      'Psychological Horror': `Confront disturbing psychological themes and mind-bending scenarios that challenge your perception of reality.`,
      'Action Horror': `Combine frightening atmosphere with combat mechanics, creating intense experiences that balance scares with empowering gameplay.`,
      
      // Fighting & Beat 'em Up
      'Fighting': `Master complex combat systems with diverse fighting styles, special moves, and competitive gameplay that rewards skill and practice.`,
      '2D Fighting': `Experience classic fighting game mechanics with precise inputs, frame-perfect timing, and deep combat systems.`,
      '3D Fighting': `Engage in three-dimensional combat with realistic martial arts, grappling systems, and cinematic fighting sequences.`,
      'Beat \'em up': `Battle through waves of enemies with satisfying combat mechanics, cooperative gameplay, and classic arcade-style action.`,
      
      // Indie & Experimental
      'Indie': `Discover creative and innovative gameplay experiences crafted by independent developers with unique artistic vision and experimental mechanics.`,
      'Experimental': `Explore groundbreaking gameplay concepts that push the boundaries of interactive entertainment and challenge gaming conventions.`,
      'Art Game': `Experience interactive art that blurs the line between entertainment and artistic expression through innovative design and meaningful themes.`,
      
      // Music & Rhythm
      'Rhythm': `Feel the beat with music-synchronized gameplay that challenges your timing, coordination, and musical appreciation.`,
      'Music': `Immerse yourself in musical experiences that combine gameplay with sound creation, rhythm challenges, or musical storytelling.`,
      
      // Casual & Family
      'Casual': `Enjoy accessible gameplay that\'s easy to learn but engaging to master, perfect for players of all skill levels and time commitments.`,
      'Family': `Share fun gaming experiences suitable for all ages with cooperative gameplay and wholesome entertainment for the entire family.`,
      'Party': `Gather friends for multiplayer fun with mini-games, competitions, and social gameplay designed for group entertainment.`,
      
      // Multiplayer Online Battle Arena
      'MOBA': `Master strategic team-based combat in competitive arenas where cooperation, skill, and tactical knowledge determine victory.`,
      
      // Card & Board Games
      'Card Game': `Experience strategic card-based gameplay with deck building, tactical thinking, and competitive or cooperative card mechanics.`,
      'Board Game': `Enjoy digital adaptations of classic board game mechanics with strategic thinking and social gameplay elements.`,
      
      // Educational & Serious Games
      'Educational': `Learn while playing with games designed to teach skills, knowledge, or concepts through engaging interactive experiences.`,
      'Trivia': `Test your knowledge across various topics in competitive quiz formats that challenge your intellect and learning.`,
      
      // Sandbox & Creative
      'Sandbox': `Express your creativity in open-ended environments with unlimited building possibilities and tools for creative expression.`,
      'Creative': `Unleash your imagination with tools and mechanics designed to foster creativity, building, and artistic expression.`,
      
      // Survival & Crafting
      'Survival': `Test your resourcefulness against harsh environments, managing hunger, shelter, and threats while exploring dangerous worlds.`,
      'Crafting': `Gather resources and create tools, weapons, and structures through detailed crafting systems that reward exploration and planning.`,
      
      // Stealth & Espionage
      'Stealth': `Master the art of remaining unseen with tactical infiltration, strategic planning, and precise execution in high-stakes scenarios.`,
      'Espionage': `Engage in covert operations with spy gadgets, intelligence gathering, and strategic missions in shadowy international intrigue.`,
    }

    // Get base description from primary genre
    let description = genreDescriptions[primaryGenre as keyof typeof genreDescriptions] || 
      `Discover an engaging ${primaryGenre.toLowerCase()} experience with immersive gameplay and stunning visuals that will captivate your imagination.`

    // Add secondary genre enhancement if available
    if (secondaryGenre && secondaryGenre !== primaryGenre && genreDescriptions[secondaryGenre as keyof typeof genreDescriptions]) {
      description += ` This title seamlessly blends ${primaryGenre.toLowerCase()} elements with ${secondaryGenre.toLowerCase()} mechanics for a unique gaming experience.`
    }

    // Enhanced rating-based enhancements
    if (rating >= 4.7) {
      description += ` This masterpiece has achieved legendary status with universal critical acclaim and is considered one of the greatest games ever made.`
    } else if (rating >= 4.5) {
      description += ` This critically acclaimed title has earned outstanding reviews for its exceptional quality and groundbreaking design.`
    } else if (rating >= 4.2) {
      description += ` This highly-rated game has received widespread praise from both critics and players for its outstanding execution.`
    } else if (rating >= 4.0) {
      description += ` This well-received title has earned positive reviews for its solid gameplay and engaging experience.`
    } else if (rating >= 3.5) {
      description += ` Join the community of players enjoying this popular gaming experience with its unique charm and entertainment value.`
    }

    // Enhanced platform variety and accessibility info
    if (platforms >= 8) {
      description += ` Available across virtually every gaming platform, ensuring maximum accessibility for all players.`
    } else if (platforms >= 5) {
      description += ` Playable on multiple major platforms, making it accessible to a wide audience of gamers.`
    } else if (platforms >= 3) {
      description += ` Available on several popular gaming platforms for convenient access.`
    }

    // Enhanced legacy/era information with gaming history context
    const currentYear = new Date().getFullYear()
    const gameAge = currentYear - releaseYear
    
    if (gameAge >= 20) {
      description += ` A timeless classic from ${releaseYear} that helped define modern gaming and continues to influence developers today.`
    } else if (gameAge >= 15) {
      description += ` A celebrated classic from ${releaseYear} that has stood the test of time and maintains a devoted fanbase.`
    } else if (gameAge >= 10) {
      description += ` A beloved game from ${releaseYear} that has become a cornerstone of gaming culture and continues to attract new players.`
    } else if (gameAge >= 5) {
      description += ` A well-established title from ${releaseYear} with a strong community and proven staying power in the gaming landscape.`
    } else if (gameAge >= 2) {
      description += ` A modern gaming experience from ${releaseYear} that represents current industry standards and innovation.`
    } else {
      description += ` A cutting-edge release showcasing the latest in gaming technology and design innovation.`
    }

    return description
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={handleCardClick}>
      {/* Game Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
        {game.background_image && (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-105',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        
        {/* Enhanced Metacritic Score Badge */}
        {game.metacritic && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg border border-white/20">
              <div className={`w-2 h-2 ${getMetacriticDotColor(game.metacritic)} rounded-full animate-pulse`}></div>
              <span className={`text-sm font-bold ${getMetacriticTextOnDark(game.metacritic)}`}>{game.metacritic}</span>
              <span className="text-xs text-gray-300 font-medium">MC</span>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <div className="absolute top-3 left-3 z-10">
          <FavoriteButton
            gameId={game.id.toString()}
            gameName={game.name}
            gameImage={game.background_image}
            gameRating={game.rating}
            gameGenres={game.genres?.map(g => g.name)}
            gamePlatforms={game.platforms}
            className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 rounded-full shadow-lg"
          />
        </div>

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 animate-pulse" />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Action Button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Button size="sm" className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg">
            <ExternalLink className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-6 space-y-4">
        {/* Title with Search Highlighting */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          <SearchHighlight 
            text={game.name}
            query={searchQuery || ''}
          />
        </h3>
        
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(game.rating)}
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatRating(game.rating)}
            </span>
          </div>
          {game.ratings_count > 0 && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <Users className="w-3 h-3 mr-1" />
              {game.ratings_count > 1000 ? `${Math.floor(game.ratings_count / 1000)}k` : game.ratings_count}
            </div>
          )}
        </div>

        {/* Enhanced Dynamic Description */}
        <div className="relative">
          <div className="max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {generateGameDescription()}
            </p>
          </div>
          {/* Fade effect for long descriptions */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5">
          {game.genres.slice(0, 3).map((genre) => (
            <span 
              key={genre.id} 
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {genre.name}
            </span>
          ))}
          {game.genres.length > 3 && (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              +{game.genres.length - 3}
            </span>
          )}
        </div>

        {/* Footer with Platform Icons and Release Date */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {(game.platforms || []).slice(0, 4).map((platform) => {
              const isClickable = PlatformUtils.isClickablePlatform(platform)
              const hoverColors = PlatformUtils.getPlatformHoverColor(platform)
              
              const handlePlatformClick = (e: React.MouseEvent) => {
                e.stopPropagation() // Prevent triggering game card click
                if (isClickable) {
                  const storeUrl = PlatformUtils.getStoreUrl(game, platform)
                  if (storeUrl) {
                    window.open(storeUrl, '_blank', 'noopener,noreferrer')
                  }
                }
              }
              
              return (
                <div
                  key={platform.platform.id}
                  onClick={handlePlatformClick}
                  className={cn(
                    "platform-container touch-target p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-200 border border-transparent",
                    isClickable ? `cursor-pointer ${hoverColors}` : "cursor-default hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                  title={isClickable ? `Open in ${PlatformUtils.getStoreName(platform)}` : platform.platform.name}
                >
                  <PlatformIcon platform={platform.platform.name} className="platform-icon w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )
            })}
            {(game.platforms || []).length > 4 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                +{game.platforms.length - 4}
              </span>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(game.released).getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
