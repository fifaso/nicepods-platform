"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react"
import type { Podcast, AudioContextType } from "@/types/podcast"
import { formatDuration } from "@/lib/utils"

const AudioContext = createContext<AudioContextType | undefined>(undefined)

// Default context value for SSR
const defaultContextValue: AudioContextType = {
  currentPodcast: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isLoading: false,
  error: null,
  playPodcast: () => {},
  togglePlayPause: () => {},
  seekTo: () => {},
  skipForward: () => {},
  skipBackward: () => {},
  setVolume: () => {},
  closePodcast: () => {},
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentPodcast, setCurrentPodcast] = useState<Podcast | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitializedRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = volume
      audioRef.current.preload = "metadata"
      isInitializedRef.current = true

      const audio = audioRef.current

      const handleTimeUpdate = () => {
        if (audio.currentTime && !isNaN(audio.currentTime)) {
          setCurrentTime(audio.currentTime)
        }
      }

      const handleDurationChange = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration)
        }
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        cleanup()
      }

      const handleLoadStart = () => {
        setIsLoading(true)
        setError(null)
      }

      const handleCanPlay = () => {
        setIsLoading(false)
      }

      const handleError = (e: Event) => {
        setIsLoading(false)
        setIsPlaying(false)
        const target = e.target as HTMLAudioElement
        const errorMessage = target.error ? `Audio error: ${target.error.message}` : "Failed to load audio"
        setError(errorMessage)
        console.error("Audio playback error:", errorMessage)
      }

      const handleLoadedMetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration)
        }
      }

      const handleWaiting = () => {
        setIsLoading(true)
      }

      const handlePlaying = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }

      const handlePause = () => {
        setIsPlaying(false)
      }

      // Add event listeners
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("durationchange", handleDurationChange)
      audio.addEventListener("loadedmetadata", handleLoadedMetadata)
      audio.addEventListener("ended", handleEnded)
      audio.addEventListener("loadstart", handleLoadStart)
      audio.addEventListener("canplay", handleCanPlay)
      audio.addEventListener("error", handleError)
      audio.addEventListener("waiting", handleWaiting)
      audio.addEventListener("playing", handlePlaying)
      audio.addEventListener("pause", handlePause)

      return () => {
        cleanup()
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("durationchange", handleDurationChange)
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
        audio.removeEventListener("ended", handleEnded)
        audio.removeEventListener("loadstart", handleLoadStart)
        audio.removeEventListener("canplay", handleCanPlay)
        audio.removeEventListener("error", handleError)
        audio.removeEventListener("waiting", handleWaiting)
        audio.removeEventListener("playing", handlePlaying)
        audio.removeEventListener("pause", handlePause)
      }
    }
  }, [volume, cleanup])

  const playPodcast = useCallback(
    (podcast: Podcast) => {
      if (!audioRef.current) return

      // Clear any existing intervals
      cleanup()
      setError(null)

      // Check if audio URL exists and is valid
      if (!podcast.audioUrl || podcast.audioUrl === "/placeholder-audio.mp3") {
        console.log("Demo mode: Audio playback simulated")
        setCurrentPodcast(podcast)
        setIsPlaying(true)

        // Use duration from podcast or default to 5 minutes
        const demoDuration = podcast.duration ? formatDuration(podcast.duration) : 300
        setDuration(demoDuration)
        setCurrentTime(0)

        // Simulate audio progress for demo
        intervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= demoDuration) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              setIsPlaying(false)
              setCurrentTime(0)
              return 0
            }
            return prev + 1
          })
        }, 1000)

        return
      }

      // Handle real audio
      if (currentPodcast?.id !== podcast.id) {
        setCurrentPodcast(podcast)
        audioRef.current.src = podcast.audioUrl
        setCurrentTime(0)
        setDuration(0)
      }

      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error)
        setError("Failed to play audio. Please try again.")
        setIsPlaying(false)
        setIsLoading(false)
      })
    },
    [currentPodcast, cleanup],
  )

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentPodcast) return

    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      audioRef.current.pause()
    } else {
      if (currentPodcast.audioUrl === "/placeholder-audio.mp3" || !currentPodcast.audioUrl) {
        // Resume demo mode
        const demoDuration = currentPodcast.duration ? formatDuration(currentPodcast.duration) : 300
        intervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= demoDuration) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
              }
              setIsPlaying(false)
              setCurrentTime(0)
              return 0
            }
            return prev + 1
          })
        }, 1000)
        setIsPlaying(true)
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Audio playback failed:", error)
          setError("Failed to resume playback. Please try again.")
        })
      }
    }
  }, [isPlaying, currentPodcast])

  const seekTo = useCallback(
    (time: number) => {
      if (!audioRef.current || !currentPodcast) return

      const clampedTime = Math.max(0, Math.min(time, duration))

      if (currentPodcast.audioUrl === "/placeholder-audio.mp3" || !currentPodcast.audioUrl) {
        setCurrentTime(clampedTime)
      } else {
        audioRef.current.currentTime = clampedTime
      }
    },
    [duration, currentPodcast],
  )

  const skipForward = useCallback(() => {
    const newTime = Math.min(currentTime + 15, duration)
    seekTo(newTime)
  }, [currentTime, duration, seekTo])

  const skipBackward = useCallback(() => {
    const newTime = Math.max(currentTime - 15, 0)
    seekTo(newTime)
  }, [currentTime, seekTo])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(newVolume, 1))
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume
    }
    setVolumeState(clampedVolume)
  }, [])

  const closePodcast = useCallback(() => {
    cleanup()
    setCurrentPodcast(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  const contextValue: AudioContextType = {
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    playPodcast,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    closePodcast,
  }

  return <AudioContext.Provider value={contextValue}>{children}</AudioContext.Provider>
}

export function useAudio() {
  const context = useContext(AudioContext)

  // Return default context for SSR or when context is undefined
  if (typeof window === "undefined" || context === undefined) {
    return defaultContextValue
  }

  return context
}
