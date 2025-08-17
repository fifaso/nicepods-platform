"use client"

import type React from "react"
import { useState } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, MapPin, UserIcon, Crown, Sparkles, AlertCircle } from "lucide-react"

export default function ProfilePage() {
  const { user, profile, loading, signOut, updateProfile } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    avatar_url: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSignOut = () => {
    signOut()
    router.push("/")
  }

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        avatar_url: profile.avatar_url || "",
      })
    }
  }, [profile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    const { error } = await updateProfile(formData)

    if (error) {
      setError("Failed to update profile. Please try again.")
    } else {
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      setTimeout(() => setSuccess(""), 3000)
    }

    setIsSaving(false)
  }

  if (loading) {
    return <div className="container py-12">Loading profile...</div>
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto backdrop-blur-lg bg-card/80 border-muted/30">
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <CardDescription>Manage your account settings and subscription preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                      {profile.full_name
                        ? profile.full_name.charAt(0).toUpperCase()
                        : profile.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{profile.full_name || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Subscription</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium capitalize">{profile.subscription_plan} Plan</p>
                      <p className="text-sm text-muted-foreground capitalize">Status: {profile.subscription_status}</p>
                    </div>
                    <Button
                      variant={profile.subscription_plan === "free" ? "default" : "outline"}
                      onClick={() => router.push("/pricing")}
                    >
                      {profile.subscription_plan === "free" ? "Upgrade" : "Manage"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
                  {/* Profile Card */}
                  <Card className="glass-card border-0 shadow-glass h-fit">
                    <CardContent className="flex flex-col items-center p-6">
                      <Avatar className="mb-4 h-24 w-24 border-4 border-primary-accessible shadow-lg">
                        <AvatarImage
                          src={formData.avatar_url || "/placeholder.svg?height=96&width=96&text=User"}
                          alt={formData.full_name || "User Avatar"}
                        />
                        <AvatarFallback className="text-4xl font-bold bg-primary text-primary-foreground">
                          {formData.full_name ? (
                            formData.full_name.charAt(0).toUpperCase()
                          ) : (
                            <UserIcon className="h-12 w-12" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <h2 className="text-center text-2xl font-bold text-primary-accessible mb-1">
                        {formData.full_name || "NicePod User"}
                      </h2>

                      <p className="text-center text-secondary-accessible mb-4">{user.email}</p>

                      <div className="mb-4 flex flex-wrap justify-center gap-2">
                        <Badge variant="secondary" className="bg-accent-background text-accent-foreground">
                          <Crown className="h-3 w-3 mr-1" />
                          {profile?.subscription_plan === "free" && "Free Tier"}
                          {profile?.subscription_plan === "thinker" && "Thinker"}
                          {profile?.subscription_plan === "pro" && "Pro"}
                        </Badge>
                      </div>

                      <div className="mb-4 w-full space-y-2 text-secondary-accessible">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {formData.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{formData.location}</span>
                          </div>
                        )}
                      </div>

                      {formData.bio && (
                        <div className="mb-6 w-full">
                          <p className="text-sm text-secondary-accessible text-center">{formData.bio}</p>
                        </div>
                      )}

                      <div className="flex w-full gap-2">
                        <Button
                          onClick={handleSignOut}
                          variant="outline"
                          className="flex-1 glass-button border-0 bg-transparent"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Settings */}
                  <Card className="glass-card border-0 shadow-glass">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-purple-600" />
                            Account Settings
                          </CardTitle>
                          <CardDescription>Update your personal information</CardDescription>
                        </div>
                        <Button
                          onClick={() => setIsEditing(!isEditing)}
                          variant={isEditing ? "outline" : "default"}
                          className={
                            isEditing
                              ? "glass-button border-0"
                              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glass border-0"
                          }
                        >
                          {isEditing ? "Cancel" : "Edit Profile"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="glass-input border-0"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email || ""}
                          disabled
                          className="glass-input border-0 opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="glass-input border-0"
                          placeholder="Your location"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="glass-input border-0 min-h-[80px]"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar_url">Avatar URL</Label>
                        <Input
                          id="avatar_url"
                          name="avatar_url"
                          value={formData.avatar_url}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="glass-input border-0"
                          placeholder="Profile picture URL"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex gap-2 pt-4 border-t">
                          <Button
                            onClick={handleSaveProfile}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-glass border-0"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </div>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {error && (
                  <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                    <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Profile not found</p>
                <Button className="mt-4" onClick={() => router.push("/")}>
                  Go to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
