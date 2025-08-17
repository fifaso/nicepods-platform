export interface Podcast {
  id: string
  title: string
  description: string
  category: string
  duration: string
  audioUrl: string
  coverImage?: string
  author?: string
  authorAvatar?: string
  authorBio?: string
  plays?: number
  likes?: number
  comments?: number
  rating?: number
  tags?: string[]
  publishedAt?: string
  createdAt?: string
  isNew?: boolean
  isTrending?: boolean
}

export interface PodcastAnalytics {
  totalPlays: number
  uniqueListeners: number
  completionRate: number
  avgRating: number
  shares: number
  bookmarks: number
}

export interface UserPodcast extends Podcast {
  status: "published" | "draft"
  visibility: "public" | "private"
  analytics?: PodcastAnalytics | null
}

export interface AudioContextType {
  currentPodcast: Podcast | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isLoading: boolean
  error: string | null
  playPodcast: (podcast: Podcast) => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  skipForward: () => void
  skipBackward: () => void
  setVolume: (volume: number) => void
  closePodcast: () => void
}

export interface FormData {
  topic: string
  motivation: string
  format: string
  duration: string
  audience: string // This field now represents narrative depth but keeps the same parameter name for backward compatibility
  title: string
  description: string
  tags: string[]
}
