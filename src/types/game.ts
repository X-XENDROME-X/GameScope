export interface Game {
  id: number
  name: string
  slug?: string
  name_original?: string
  description_raw?: string
  background_image: string
  rating: number
  rating_top: number
  ratings_count: number
  reviews_count?: number
  metacritic: number
  metacritic_url?: string
  released: string
  genres: Genre[]
  platforms: Platform[]
  screenshots?: Screenshot[]
  trailers?: Trailer[]
  website?: string
  reddit_url?: string
  reddit_name?: string
  reddit_description?: string
  reddit_logo?: string
  reddit_count?: number
  youtube_count?: number
  twitch_count?: number
  playtime?: number
  developers?: Developer[]
  publishers?: Publisher[]
  esrb_rating?: ESRBRating
  stores?: Store[]
  dominant_color?: string
  saturated_color?: string
  clip?: {
    clip: string
    clips: {
      [key: string]: string
    }
  }
}

export interface Genre {
  id: number
  name: string
  slug: string
}

export interface Platform {
  platform: {
    id: number
    name: string
    slug: string
  }
}

export interface Screenshot {
  id: number
  image: string
}

export interface Trailer {
  id: number
  name: string
  preview: string
  data: {
    480: string
    max: string
  }
}

export interface Developer {
  id: number
  name: string
  slug: string
}

export interface Publisher {
  id: number
  name: string
  slug: string
}

export interface ESRBRating {
  id: number
  name: string
  slug: string
}

export interface Store {
  id: number
  store: {
    id: number
    name: string
    slug: string
  }
}

export interface Review {
  id: number
  text: string
  rating: number
  user?: {
    id: number
    username: string
    avatar?: string
  } | null
  created: string
  updated: string
}

export interface GameSearchParams {
  search?: string
  genres?: string
  platforms?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface GameResponse {
  count: number
  results: Game[]
  next: string | null
  previous: string | null
}
