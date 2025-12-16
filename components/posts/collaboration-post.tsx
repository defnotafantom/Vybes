"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface CollaborationPostProps {
  onPostCreate: (data: {
    content: string
    type: string
    collaborationArtists: string[]
  }) => void
  onClose: () => void
}

export function CollaborationPost({ onPostCreate, onClose }: CollaborationPostProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [selectedArtists, setSelectedArtists] = useState<Array<{ id: string; name: string; image: string | null }>>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; image: string | null }>>([])
  const [loading, setLoading] = useState(false)

  const searchArtists = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=users`)
      if (response.ok) {
        const data = await response.json()
        const artists = data.users.filter(
          (user: any) => user.role === 'ARTIST' && user.id !== session?.user?.id
        )
        setSearchResults(artists.slice(0, 5))
      }
    } catch (error) {
      console.error('Error searching artists:', error)
    }
  }

  const handleAddArtist = (artist: { id: string; name: string; image: string | null }) => {
    if (!selectedArtists.find((a) => a.id === artist.id)) {
      setSelectedArtists([...selectedArtists, artist])
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleRemoveArtist = (artistId: string) => {
    setSelectedArtists(selectedArtists.filter((a) => a.id !== artistId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || selectedArtists.length === 0) return

    setLoading(true)
    try {
      await onPostCreate({
        content: content.trim(),
        type: 'COLLABORATION',
        collaborationArtists: selectedArtists.map((a) => a.id),
      })
      setContent('')
      setSelectedArtists([])
      onClose()
    } catch (error) {
      console.error('Error creating collaboration post:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sky-500" />
          Crea Collaborazione
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Content */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Descrizione Collaborazione *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descrivi la collaborazione che vuoi proporre..."
              rows={4}
              required
              className="w-full px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Artist Search */}
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
              Invita Artisti *
            </label>
            <div className="space-y-2">
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  searchArtists(e.target.value)
                }}
                placeholder="Cerca artisti da invitare..."
                className="bg-white dark:bg-gray-900"
              />
              {searchResults.length > 0 && (
                <div className="border border-sky-200 dark:border-sky-800 rounded-lg p-2 space-y-1 max-h-40 overflow-y-auto">
                  {searchResults.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => handleAddArtist(artist)}
                      className="w-full flex items-center gap-2 p-2 rounded hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={artist.image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                          {artist.name?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {artist.name || 'Artista'}
                      </span>
                      <UserPlus className="h-4 w-4 ml-auto text-sky-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Artists */}
          {selectedArtists.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                Artisti Invitati ({selectedArtists.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-100 dark:bg-sky-900/30 rounded-full"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={artist.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-xs">
                        {artist.name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {artist.name || 'Artista'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveArtist(artist.id)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={loading || !content.trim() || selectedArtists.length === 0}
              className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            >
              {loading ? 'Creazione...' : 'Crea Collaborazione'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

