"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { useLanguage } from '@/components/providers/language-provider'
import { User, Save, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { prepareImageForUpload } from '@/lib/image-upload-client'

interface UserProfile {
  id: string
  name: string | null
  email: string
  username: string | null
  bio: string | null
  image: string | null
  location: string | null
  website: string | null
  role: string
  coins: number
}

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const { toast } = useToast()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
  })
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
        })
        setPreviewImage(data.image)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const prepared = await prepareImageForUpload(file, 'profile')
      const formData = new FormData()
      formData.append('file', prepared)
      formData.append('folder', 'profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setPreviewImage(data.url)
        toast({
          title: t('toast.imageUploaded'),
          description: language === 'it' ? 'Caricata e ottimizzata (WebP).' : 'Uploaded and optimized (WebP).',
        })
      } else {
        toast({
          title: t('toast.error'),
          description: data.error || t('toast.imageUploadError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: t('toast.error'),
        description: error instanceof Error ? error.message : t('toast.imageUploadError'),
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || null,
          username: formData.username || null,
          bio: formData.bio || null,
          location: formData.location || null,
          website: formData.website || null,
          image: previewImage,
        }),
      })

      if (response.ok) {
        toast({
          title: t('toast.profileUpdated'),
          description: undefined,
        })
        fetchProfile()
      } else {
        const data = await response.json()
        toast({
          title: t('toast.error'),
          description: data.error || t('toast.profileUpdateError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.profileUpdateError'),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddRole = async (roleToAdd: 'ARTIST' | 'RECRUITER') => {
    if (!profile) return

    try {
      // Get current roles
      const currentRoles: string[] = []
      if (profile.role === 'ARTIST') currentRoles.push('ARTIST')
      if (profile.role === 'RECRUITER') currentRoles.push('RECRUITER')
      if (profile.role === 'ARTIST_RECRUITER') {
        currentRoles.push('ARTIST')
        currentRoles.push('RECRUITER')
      }

      // Add new role if not already present
      if (!currentRoles.includes(roleToAdd)) {
        currentRoles.push(roleToAdd)
      }

      const addRoles = currentRoles
      const removeRoles: string[] = []

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addRoles, removeRoles }),
      })

      if (response.ok) {
        toast({
          title: t('toast.roleAdded'),
          description: t('toast.roleAddedDesc'),
        })
        fetchProfile()
      } else {
        const data = await response.json()
        toast({
          title: t('toast.error'),
          description: data.error || t('toast.roleAddError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding role:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.roleAddError'),
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12">{t('common.loading')}</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {t('settings.description')}
        </p>
      </div>

      {/* Profile Information */}
      <Card className="glass-card">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-t-xl">
          <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="h-5 w-5 text-sky-500" />
            {t('settings.profile.title')}
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {t('settings.profile.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-sky-200 dark:ring-sky-800 shadow-lg">
                <AvatarImage src={previewImage || undefined} />
                <AvatarFallback className="text-4xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold">
                  {formData.name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {previewImage && (
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="image-upload" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4" />
                    {uploading ? t('common.loading') : t('settings.profile.uploadImage')}
                  </span>
                </Button>
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings.profile.imageTypes')}
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('settings.profile.name')}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('common.name')}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('settings.profile.username')}
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t('settings.profile.username')}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('common.email')}
            </Label>
            <Input
              id="email"
              value={profile?.email || ''}
              disabled
              className="bg-slate-100 dark:bg-gray-700/50 border-2 border-slate-200 dark:border-slate-700 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.profile.emailNote')}
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('settings.profile.bio')}
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={t('settings.profile.bioPlaceholder')}
              rows={4}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formData.bio.length} / 500 {language === 'it' ? 'caratteri' : 'characters'}
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('settings.profile.location')}
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('settings.profile.locationPlaceholder')}
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-slate-700 dark:text-slate-300 font-semibold">
              {t('settings.profile.website')}
            </Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder={t('settings.profile.websitePlaceholder')}
              type="url"
              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings.profile.websiteNote')}
            </p>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all hover:scale-105"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('settings.profile.saving') : t('settings.profile.save')}
          </Button>
        </CardContent>
      </Card>

      {/* Role Management */}
      {profile && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              {t('settings.roles.title')}
            </CardTitle>
            <CardDescription>
              {t('settings.roles.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {profile.role === 'ARTIST' || profile.role === 'ARTIST_RECRUITER' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                  <span className="font-semibold text-blue-700 dark:text-blue-300">🎨 {t('settings.roles.artist')}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleAddRole('ARTIST')}
                  className="border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {t('settings.roles.addArtist')}
                </Button>
              )}

              {profile.role === 'RECRUITER' || profile.role === 'ARTIST_RECRUITER' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-700">
                  <span className="font-semibold text-green-700 dark:text-green-300">🎯 {t('settings.roles.recruiter')}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleAddRole('RECRUITER')}
                  className="border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  {t('settings.roles.addRecruiter')}
                </Button>
              )}
            </div>

            {(profile.role === 'ARTIST' || profile.role === 'RECRUITER' || profile.role === 'ARTIST_RECRUITER') && (
              <div className="pt-4 border-t border-purple-200 dark:border-purple-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('settings.roles.active')}: {profile.role === 'ARTIST_RECRUITER' 
                    ? `${t('settings.roles.artist')} + ${t('settings.roles.recruiter')}` 
                    : profile.role === 'ARTIST' 
                    ? t('settings.roles.artist') 
                    : t('settings.roles.recruiter')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Appearance */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-t-xl">
          <CardTitle className="text-slate-800 dark:text-slate-100">{t('settings.appearance.title')}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {t('settings.appearance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
            <div className="space-y-0.5">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('settings.appearance.theme')}</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.appearance.themeDesc')}
              </p>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
            <div className="space-y-0.5">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('settings.appearance.language')}</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.appearance.languageDesc')}
              </p>
            </div>
            <LanguageToggle />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-t-xl">
          <CardTitle className="text-slate-800 dark:text-slate-100">{t('settings.notifications.title')}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {t('settings.notifications.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
            <div className="space-y-0.5">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('settings.notifications.email')}</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.notifications.emailDesc')}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800">
            <div className="space-y-0.5">
              <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('settings.notifications.push')}</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('settings.notifications.pushDesc')}
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-t-xl">
          <CardTitle className="text-slate-800 dark:text-slate-100">{t('settings.account.title')}</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            {t('settings.account.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button variant="outline" className="w-full border-2 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-500 dark:hover:border-sky-500 transition-all">
            {t('settings.account.changePassword')}
          </Button>
          <Button variant="outline" className="w-full border-2 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 text-red-600 dark:text-red-400 transition-all" disabled>
            {t('settings.account.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
