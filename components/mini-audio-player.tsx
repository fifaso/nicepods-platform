"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X, Minimize2, Loader2, AlertCircle } from "lucide-react"
import { useAudio } from "@/contexts/audio-context"
import { formatTime } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export function MiniAudioPlayer() {
  const {
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    error,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    closePodcast,
  } = useAudio()

  const [isMinimized, setIsMinimized] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(volume)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Handle hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast({
        title: "Audio Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Memoized waveform bars to prevent recreation on every render
  const waveformBars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      height: Math.random() * 20 + 8,
      delay: i * 0.1,
    }))
  }, [])

  // Don't render on server or if no current podcast
  if (!isMounted || !currentPodcast) return null

  const handleProgressChange = (value: number[]) => {
    if (value[0] !== undefined) {
      seekTo(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (value[0] !== undefined) {
      const newVolume = value[0] / 100
      setVolume(newVolume)
      if (newVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    }
  }

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume)
      setIsMuted(false)
    } else {
      setPreviousVolume(volume)
      setVolume(0)
      setIsMuted(true)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case " ":
        event.preventDefault()
        togglePlayPause()
        break
      case "ArrowLeft":
        event.preventDefault()
        skipBackward()
        break
      case "ArrowRight":
        event.preventDefault()
        skipForward()
        break
      case "Escape":
        event.preventDefault()
        closePodcast()
        break
    }
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <Card
        className={`glass-card border-0 shadow-glass transition-all duration-300 ${
          isMinimized ? "w-16 h-16" : "w-80"
        } overflow-hidden group hover:shadow-soft`}
        role="region"
        aria-label="Audio player"
      >
        {isMinimized ? (
          // Minimized view
          <CardContent className="p-0 h-full flex items-center justify-center">
            <Button
              onClick={() => setIsMinimized(false)}
              variant="ghost"
              size="icon"
              className="w-full h-full rounded-lg glass-button border-0 group-hover:scale-110 transition-transform duration-300"
              aria-label={`Expand audio player. Currently playing: ${currentPodcast.title}`}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-purple-accessible" />
              ) : error ? (
                <AlertCircle className="h-6 w-6 text-red-500" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6 text-purple-accessible" />
              ) : (
                <Play className="h-6 w-6 text-purple-accessible" />
              )}
            </Button>
          </CardContent>
        ) : (
          // Expanded view
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate mb-1">
                  {currentPodcast.title}
                </h3>
                <Badge variant="secondary" className="text-xs glass text-purple-accessible-dark border-0">
                  {currentPodcast.category}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  onClick={() => setIsMinimized(true)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-button border-0 opacity-70 hover:opacity-100 text-gray-700 dark:text-gray-300"
                  aria-label="Minimize player"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={closePodcast}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-button border-0 opacity-70 hover:opacity-100 hover:text-red-600 text-gray-700 dark:text-gray-300 dark:hover:text-red-400"
                  aria-label="Close player"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="w-full cursor-pointer"
                aria-label={`Seek to position. Current time: ${formatTime(currentTime)}, Duration: ${formatTime(duration)}`}
                disabled={isLoading || !!error}
              />
              <div className="flex justify-between text-xs text-muted-accessible font-medium">
                <span aria-live="polite">{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Button
                  onClick={skipBackward}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-button border-0 hover:scale-110 transition-transform duration-200 text-gray-700 dark:text-gray-300"
                  aria-label="Skip backward 15 seconds"
                  disabled={isLoading || !!error}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-glass border-0 hover:scale-110 transition-all duration-200 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600"
                  disabled={isLoading}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : error ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  onClick={skipForward}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-button border-0 hover:scale-110 transition-transform duration-200 text-gray-700 dark:text-gray-300"
                  aria-label="Skip forward 15 seconds"
                  disabled={isLoading || !!error}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="relative">
                <Button
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  onDoubleClick={toggleMute}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 glass-button border-0 hover:scale-110 transition-transform duration-200 text-gray-700 dark:text-gray-300"
                  aria-label={`Volume: ${Math.round(volume * 100)}%. ${isMuted ? "Muted" : "Unmuted"}`}
                >
                  {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                {showVolumeSlider && (
                  <div className="absolute bottom-full right-0 mb-2 p-3 glass-card border-0 shadow-glass rounded-lg">
                    <div className="h-20 flex items-center">
                      <Slider
                        value={[volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        orientation="vertical"
                        className="h-16"
                        aria-label="Volume control"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Waveform visualization */}
            <div className="h-8 flex items-center justify-center space-x-1 opacity-50" aria-hidden="true">
              {waveformBars.map((bar) => (
                <div
                  key={bar.id}
                  className={`w-1 bg-gradient-to-t from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 rounded-full transition-all duration-300 ${
                    isPlaying && !error ? "animate-pulse" : ""
                  }`}
                  style={{
                    height: `${bar.height}px`,
                    animationDelay: `${bar.delay}s`,
                  }}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
