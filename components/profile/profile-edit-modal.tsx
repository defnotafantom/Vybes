"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string | null
  email: string
  username: string | null
  bio: string | null
  image: string | null
  location?: string | null
  website?: string | null
}

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile | null
  onSave: () => void
}

export function ProfileEditModal({ isOpen, onClose, profile, onSave }: ProfileEditModalProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    image: '',
    location: '',
    website: '',
  })

  useEffect(() => {
    if (profile && isOpen) {
      setFormData({
        name: profile.name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        image: profile.image || '',
        location: profile.location || '',
        website: profile.website || '',
      })
    }
  }, [profile, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: t('toast.profileUpdated'),
          description: undefined,
        })
        onSave()
        onClose()
      } else {
        const data = await response.json()
        toast({
          title: t('toast.error'),
          description: data.error || t('toast.profileUpdateError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.profileUpdateError'),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('toast.error'),
        description: t('toast.imageTypeError'),
        variant: 'destructive',
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('toast.error'),
        description: t('toast.imageSizeError'),
        variant: 'destructive',
      })
      return
    }

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image: data.url }))
        toast({
          title: t('toast.imageUploaded'),
          description: t('toast.imageUploadSuccess'),
        })
      } else {
        toast({
          title: t('toast.error'),
          description: t('toast.imageUploadError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.imageUploadError'),
        variant: 'destructive',
      })
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-br from-white/95 via-sky-50/50 to-blue-50/50 dark:from-gray-800/95 dark:via-sky-900/30 dark:to-blue-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-sky-200/50 dark:border-sky-800/50 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-sky-200 dark:border-sky-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:scale-110 transition-all shadow-sm"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="p-6 border-b border-sky-200 dark:border-sky-800">
                <h2 className="text-2xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  {t('profile.edit')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                  {t('profile.edit.subtitle')}
                </p>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-200 to-blue-200 dark:from-sky-800 dark:to-blue-800 border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden">
                      {formData.image ? (
                        <Image
                          src={formData.image}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-sky-600 dark:text-sky-400">
                          {formData.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="image-upload"
                      className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg hover:scale-110"
                    >
                      <Upload className="h-4 w-4 text-white" />
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {t('profile.edit.uploadHint')}
                  </p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold">
                    {t('settings.profile.name')}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('settings.profile.name')}
                    className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder={t('settings.profile.username')}
                    className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('profile.edit.profileLinkHint')} vybes.com/@{formData.username || 'username'}
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('settings.profile.bioPlaceholder')}
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 rounded-xl bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 dark:text-slate-200 resize-none"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
                    {formData.bio.length}/500 caratteri
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Posizione
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('settings.profile.locationPlaceholder')}
                    className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
                  />
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-slate-700 dark:text-slate-300 font-semibold">
                    Sito Web / Link
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder={t('settings.profile.websitePlaceholder')}
                    className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border-2 border-sky-200 dark:border-sky-800 focus:border-sky-500 dark:focus:border-sky-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-sky-200 dark:border-sky-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          ⏳
                        </motion.span>
                        Salvataggio...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        Salva Modifiche
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

