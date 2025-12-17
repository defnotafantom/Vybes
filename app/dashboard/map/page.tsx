"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Calendar, Users, Search, Plus, X, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/event-map'), { ssr: false })

interface Event {
  id: string
  title: string
  description: string
  latitude: number
  longitude: number
  startDate: string
  type: string
  city?: string
  imageUrl?: string | null
  recruiter: {
    name: string | null
  }
}

type FilterKind = 'all' | 'opportunity' | 'collaboration' | 'events'

export default function MapPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterKind, setFilterKind] = useState<FilterKind>('all')
  const [artTag, setArtTag] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?status=map&limit=200')
      if (response.ok) {
        const data = await response.json()
        // Handle both old format (array) and new format (object with events property)
        setEvents(Array.isArray(data) ? data : (data.events || []))
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const normalizedType = (event.type || '').toUpperCase()
    const matchesKind =
      filterKind === 'all'
        ? true
        : filterKind === 'collaboration'
          ? normalizedType === 'COLLABORATION'
          : filterKind === 'events'
            ? normalizedType === 'EVENT'
            : normalizedType !== 'COLLABORATION' // opportunity = everything non-collaboration by default

    // Events do not currently have "tags" in the DB; we support lightweight tag filtering by:
    // - using #hashtags in description/title (e.g. "#danza") OR
    // - matching plain words (e.g. "danza") when artTag is selected.
    const matchesArtTag =
      artTag === 'all'
        ? true
        : (`${event.title} ${event.description}`.toLowerCase().includes(`#${artTag.toLowerCase()}`) ||
            `${event.title} ${event.description}`.toLowerCase().includes(artTag.toLowerCase()))

    return matchesSearch && matchesKind && matchesArtTag
  })

  const handleMapClick = (lat: number, lng: number) => {
    if ((session?.user?.role === 'RECRUITER' || session?.user?.role === 'ARTIST' || session?.user?.role === 'ARTIST_RECRUITER') && !showNewPost) {
      setSelectedLocation({ lat, lng })
      setShowNewPost(true)
    }
  }

  const addNewMarker = async (data: {
    title: string
    description: string
    type: string
    city: string
    lat: number
    lng: number
    images?: string[]
  }) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          type: data.type === 'opportunity' ? 'EVENT' : 'COLLABORATION',
          city: data.city,
          latitude: data.lat,
          longitude: data.lng,
          // Make sure newly created markers are visible in "upcoming" too (avoid ms drift),
          // but map uses status=map anyway.
          startDate: new Date(Date.now() + 60_000).toISOString(),
          imageUrl: data.images?.filter(Boolean)?.[0] || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: t('toast.markerCreated'),
          description: undefined,
        })
        setShowNewPost(false)
        setSelectedLocation(null)
        fetchEvents()
      } else {
        toast({
          title: t('toast.error'),
          description: t('toast.markerCreateError'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast({
        title: t('toast.error'),
        description: t('toast.markerCreateError'),
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-slate-600 dark:text-slate-400">{t('map.loading')}</div>
  }

  const canCreateMarker = session?.user?.role === 'RECRUITER' || session?.user?.role === 'ARTIST' || session?.user?.role === 'ARTIST_RECRUITER'

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] p-2 md:p-4 flex flex-col gap-2 md:gap-4">
      {/* TOP BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl border border-sky-200 dark:border-sky-800 z-20">
        {/* Nuovo Marker (LEFT) */}
        {canCreateMarker && (
          <button
            onClick={() => {
              setShowNewPost(true)
              setSelectedLocation(null)
            }}
            className="px-3 md:px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 text-sm md:text-base whitespace-nowrap order-1"
          >
            <Plus size={18} /> <span className="hidden sm:inline">{t('map.newMarker')}</span>
            <span className="sm:hidden">{t('map.newMarkerShort')}</span>
          </button>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-2xl mx-2 order-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input
            type="text"
            placeholder={t('map.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-gray-900 rounded-xl pl-10 pr-4 py-2 border-2 border-sky-200 dark:border-sky-800 shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Filtri (RIGHT) */}
        <div className="flex flex-wrap gap-2 justify-center order-3">
          <button
            className={cn(
              "px-3 md:px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200 text-sm md:text-base",
              filterKind === "opportunity"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-2 border-sky-200 dark:border-sky-800 hover:border-sky-500"
            )}
            onClick={() => setFilterKind(filterKind === "opportunity" ? "all" : "opportunity")}
          >
            Opportunità Lavorativa
          </button>
          <button
            className={cn(
              "px-3 md:px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200 text-sm md:text-base",
              filterKind === "collaboration"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-2 border-sky-200 dark:border-sky-800 hover:border-sky-500"
            )}
            onClick={() => setFilterKind(filterKind === "collaboration" ? "all" : "collaboration")}
          >
            Collaborazione
          </button>
          <button
            className={cn(
              "px-3 md:px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200 text-sm md:text-base",
              filterKind === "events"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30"
                : "bg-white dark:bg-gray-800 text-slate-700 dark:text-slate-300 border-2 border-sky-200 dark:border-sky-800 hover:border-sky-500"
            )}
            onClick={() => setFilterKind(filterKind === "events" ? "all" : "events")}
          >
            Eventi
          </button>

          <select
            value={artTag}
            onChange={(e) => setArtTag(e.target.value)}
            className="h-10 px-3 rounded-xl border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm md:text-base"
            title="Art Tags"
          >
            <option value="all">Art Tags</option>
            <option value="danza">Danza</option>
            <option value="canto">Canto</option>
            <option value="teatro">Teatro</option>
            <option value="musica">Musica</option>
            <option value="fotografia">Fotografia</option>
            <option value="pittura">Pittura</option>
          </select>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="relative flex-1 flex items-stretch justify-center gap-4">
        {/* Colonna Nuovo Annuncio */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ scale: 0, opacity: 0, x: -100 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: -100 }}
              className="absolute left-0 top-0 h-full w-full sm:w-[350px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-sky-200 dark:border-sky-800 p-4 z-20"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">{t('map.newMarker')}</h2>
                <X 
                  size={20} 
                  className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" 
                  onClick={() => {
                    setShowNewPost(false)
                    setSelectedLocation(null)
                  }} 
                />
              </div>
              <NewPostForm onSubmit={addNewMarker} selectedLocation={selectedLocation} t={t} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAPPA CENTRALE */}
        <div className="flex-1 max-w-[900px] rounded-3xl overflow-hidden shadow-xl border border-sky-200 dark:border-sky-800 z-10 bg-white dark:bg-gray-900 relative">
          <Map 
            events={filteredEvents} 
            onEventClick={(event) => setSelectedEvent(event)}
            onMapClick={handleMapClick}
            locale={language === 'it' ? 'it-IT' : 'en-US'}
          />
          {canCreateMarker && !showNewPost && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-sky-200 dark:border-sky-800 z-30 text-sm text-slate-600 dark:text-slate-400">
              {t('map.clickToAdd')}
            </div>
          )}
          {showNewPost && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-sky-200 dark:border-sky-800 z-30 text-sm text-slate-600 dark:text-slate-400">
              {t('map.clickToAdd')}
            </div>
          )}
        </div>

        {/* Colonna Dettaglio Marker */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ scale: 0, opacity: 0, x: 100 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0, opacity: 0, x: 100 }}
              className="absolute right-0 top-0 h-full w-full sm:w-[350px] bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-sky-200 dark:border-sky-800 p-4 z-20 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-slate-800 dark:text-slate-100">{selectedEvent.title}</h2>
                <X 
                  size={20} 
                  className="cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" 
                  onClick={() => setSelectedEvent(null)} 
                />
              </div>

              {/* Gallery: map preview + optional creator images */}
              <MarkerGallery
                title={selectedEvent.title}
                latitude={selectedEvent.latitude}
                longitude={selectedEvent.longitude}
                imageUrl={selectedEvent.imageUrl || undefined}
              />

              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedEvent.recruiter.name?.charAt(0).toUpperCase() || 'E'}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedEvent.recruiter.name || t('map.detail.organizer')}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedEvent.type}</p>
                </div>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{selectedEvent.description}</p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-500" />
                  <span>
                    {new Date(selectedEvent.startDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {selectedEvent.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-500" />
                    <span>{selectedEvent.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-sky-500" />
                  <span className="text-xs">
                    {selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
              <div className="mt-auto flex gap-2 pt-4">
                {session?.user?.role === 'ARTIST' && (
                  <button className="flex-1 px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-sky-500/30 hover:scale-105 transition-all font-semibold">
                    {t('map.detail.apply')}
                  </button>
                )}
                <button className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border-2 border-sky-300 dark:border-sky-700 text-slate-700 dark:text-slate-300 rounded-xl shadow hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-500 transition-all font-semibold">
                  {t('map.detail.contact')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MarkerGallery({
  title,
  latitude,
  longitude,
  imageUrl,
}: {
  title: string
  latitude: number
  longitude: number
  imageUrl?: string
}) {
  const [idx, setIdx] = useState(0)

  // Mapillary (Meta) street-level images (crowdsourced).
  // Uses a public client token (NEXT_PUBLIC_MAPILLARY_TOKEN) and fetches a few nearby thumbnails.
  const mapillaryToken = process.env.NEXT_PUBLIC_MAPILLARY_TOKEN
  const [streetShots, setStreetShots] = useState<string[]>([])
  const [streetStatus, setStreetStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!mapillaryToken) {
        setStreetShots([])
        setStreetStatus('idle')
        return
      }

      setStreetStatus('loading')
      try {
        // Small bbox around the point (degrees). ~0.001 ≈ 100m (varies with latitude)
        const d = 0.001
        const minLon = longitude - d
        const minLat = latitude - d
        const maxLon = longitude + d
        const maxLat = latitude + d

        const url =
          `https://graph.mapillary.com/images` +
          `?fields=id,thumb_1024_url` +
          `&bbox=${minLon},${minLat},${maxLon},${maxLat}` +
          `&limit=6` +
          `&access_token=${encodeURIComponent(mapillaryToken)}`

        // Using access_token in query avoids CORS issues in some environments
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Mapillary ${res.status}`)
        const json = await res.json()
        const urls = (json?.data || [])
          .map((x: any) => x?.thumb_1024_url)
          .filter(Boolean)
          .slice(0, 3)

        if (cancelled) return
        setStreetShots(urls)
        setStreetStatus('ready')
      } catch (e) {
        if (cancelled) return
        setStreetShots([])
        setStreetStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [latitude, longitude, mapillaryToken])

  const mapPreview = `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=16&size=640x360&maptype=mapnik&markers=${latitude},${longitude},lightblue1`
  const creatorImages = (imageUrl ? [imageUrl] : []).filter(Boolean)
  const images = [...streetShots, mapPreview, ...creatorImages]

  const current = images[Math.min(idx, images.length - 1)]
  const canPrev = idx > 0
  const canNext = idx < images.length - 1

  const labelForIdx = (i: number) => {
    if (streetShots.length > 0 && i < streetShots.length) return 'Foto zona (Mapillary)'
    if (i === streetShots.length) return 'Preview zona (mappa)'
    return 'Foto del creatore'
  }

  return (
    <div className="mb-4">
      <div className="relative rounded-2xl overflow-hidden border border-sky-200 dark:border-sky-800 bg-white/50 dark:bg-gray-900/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={title}
          className="w-full h-40 object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={!canPrev}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm border transition-all",
                canPrev
                  ? "bg-white/70 dark:bg-gray-800/70 border-sky-200 dark:border-sky-800 text-slate-800 dark:text-slate-100 hover:bg-white/90"
                  : "bg-white/40 dark:bg-gray-900/40 border-sky-200/60 dark:border-sky-800/60 text-slate-400 cursor-not-allowed"
              )}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setIdx((v) => Math.min(images.length - 1, v + 1))}
              disabled={!canNext}
              className={cn(
                "px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm border transition-all",
                canNext
                  ? "bg-white/70 dark:bg-gray-800/70 border-sky-200 dark:border-sky-800 text-slate-800 dark:text-slate-100 hover:bg-white/90"
                  : "bg-white/40 dark:bg-gray-900/40 border-sky-200/60 dark:border-sky-800/60 text-slate-400 cursor-not-allowed"
              )}
            >
              Next
            </button>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {labelForIdx(idx)}
        {images.length > 1 ? ` • ${idx + 1}/${images.length}` : ''}
        {!mapillaryToken ? ' • (Per foto reali: aggiungi NEXT_PUBLIC_MAPILLARY_TOKEN)' : ''}
        {mapillaryToken && streetStatus === 'loading' ? ' • (carico foto...)' : ''}
        {mapillaryToken && streetStatus === 'error' ? ' • (foto non disponibili qui)' : ''}
      </div>
    </div>
  )
}

// FORM NUOVO ANNUNCIO
function NewPostForm({ onSubmit, selectedLocation, t }: { onSubmit: (data: any) => void, selectedLocation?: { lat: number; lng: number } | null, t: (key: string) => string }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<"opportunity" | "artist">("opportunity")
  const [city, setCity] = useState("")
  const [lat, setLat] = useState(selectedLocation ? selectedLocation.lat.toString() : "")
  const [lng, setLng] = useState(selectedLocation ? selectedLocation.lng.toString() : "")
  const [locationSearch, setLocationSearch] = useState("")
  const [locationResults, setLocationResults] = useState<any[]>([])
  const [showLocationResults, setShowLocationResults] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    if (selectedLocation) {
      setLat(selectedLocation.lat.toString())
      setLng(selectedLocation.lng.toString())
    }
  }, [selectedLocation])

  // Geocoding search
  useEffect(() => {
    if (!locationSearch || locationSearch.length < 3) {
      setLocationResults([])
      setShowLocationResults(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoadingLocation(true)
      try {
        const response = await fetch(`/api/geocoding?q=${encodeURIComponent(locationSearch)}`)
        if (response.ok) {
          const data = await response.json()
          setLocationResults(data.results || [])
          setShowLocationResults(true)
        }
      } catch (error) {
        console.error('Error searching location:', error)
      } finally {
        setLoadingLocation(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [locationSearch])

  const handleLocationSelect = (result: any) => {
    setLocationSearch(result.display_name)
    setCity(result.city || result.address?.city || result.address?.town || result.address?.village || result.address?.municipality || '')
    setLat(result.lat.toString())
    setLng(result.lon.toString())
    setShowLocationResults(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !city || !lat || !lng) return
    onSubmit({ title, description, type, city, lat: parseFloat(lat), lng: parseFloat(lng), images: imageUrl ? [imageUrl] : [] })
    setTitle("")
    setDescription("")
    setCity("")
    setLocationSearch("")
    setLat("")
    setLng("")
    setType("opportunity")
    setShowLocationResults(false)
    setImageUrl("")
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      {selectedLocation && (
        <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sm text-sky-700 dark:text-sky-300">
          {t('map.selectLocation')}: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
        </div>
      )}
      <Input
        type="text"
        placeholder={t('placeholder.title')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl"
        required
      />
      <Textarea
        placeholder={t('placeholder.description')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl min-h-[100px] resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        required
      />
      {/* Location Search */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-sky-500" />
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('map.enterLocation')}</label>
        </div>
        <Input
          type="text"
          placeholder={t('placeholder.location')}
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          onFocus={() => {
            if (locationResults.length > 0) setShowLocationResults(true)
          }}
          className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl"
        />
        {loadingLocation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
          </div>
        )}
        {showLocationResults && locationResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-sky-200 dark:border-sky-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {locationResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full text-left p-3 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors border-b border-sky-100 dark:border-sky-900 last:border-b-0"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{result.display_name}</div>
                {result.city && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{result.city}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <Input
        type="text"
        placeholder={t('placeholder.city')}
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl"
        required
      />
      <div className="flex gap-2">
        <Input
          type="number"
          step="any"
          placeholder={t('placeholder.latitude')}
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl flex-1"
          required
        />
        <Input
          type="number"
          step="any"
          placeholder={t('placeholder.longitude')}
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl flex-1"
          required
        />
      </div>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as "opportunity" | "artist")}
        className="p-2 border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
      >
        <option value="opportunity">{t('map.marker.typeOpportunity')}</option>
        <option value="artist">{t('map.marker.typeCollaboration')}</option>
      </select>

      <Input
        type="url"
        placeholder="URL foto (opzionale)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl"
      />
      <Button
        type="submit"
        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-105 font-semibold"
      >
        {t('map.marker.create')}
      </Button>
    </form>
  )
}
