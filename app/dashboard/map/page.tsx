"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Calendar, Users, Search, Plus, X, Loader2, SlidersHorizontal } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'
import { prepareMediaForUpload } from '@/lib/image-upload-client'

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map/event-map'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
        <span className="text-slate-600 dark:text-slate-400 text-sm">Caricamento mappa...</span>
      </div>
    </div>
  )
})

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
    id?: string
    name: string | null
  }
}

type FilterKind = 'all' | 'opportunity' | 'collaboration' | 'events'

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
        active
          ? 'bg-sky-500 text-white shadow-md'
          : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      {children}
    </button>
  )
}

export default function MapPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewPost, setShowNewPost] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [contacting, setContacting] = useState(false)
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

  const handleContact = async (ev: Event) => {
    if (!ev.recruiter?.id) {
      toast({ title: t('toast.error'), description: 'Destinatario non disponibile', variant: 'destructive' })
      return
    }
    setContacting(true)
    try {
      const cRes = await fetch('/api/messages/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: ev.recruiter.id }),
      })
      if (!cRes.ok) {
        const err = await cRes.json().catch(() => ({}))
        throw new Error(err?.error || `Errore creazione chat (${cRes.status})`)
      }
      const conversation = await cRes.json()

      const refLine = `📍 Riferimento: ${ev.title} (${(ev.type || '').toUpperCase() === 'COLLABORATION' ? 'Collaborazione' : 'Evento / Opportunità'})`
      const locLine = `🗺️ Posizione: ${ev.latitude.toFixed(5)}, ${ev.longitude.toFixed(5)}${ev.city ? ` • ${ev.city}` : ''}`
      const linkLine = `🔗 Link: /dashboard/events/${ev.id}`
      const content = `Ciao! Ti contatto dal marker sulla mappa.\n\n${refLine}\n${locLine}\n${linkLine}\n\nMessaggio: `

      // Send initial message (so it appears in inbox immediately)
      const mRes = await fetch(`/api/messages/${conversation.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!mRes.ok) {
        const err = await mRes.json().catch(() => ({}))
        throw new Error(err?.error || `Errore invio messaggio (${mRes.status})`)
      }

      toast({ title: 'Messaggio inviato', description: 'Conversazione creata nella dashboard messaggi.' })
      setSelectedEvent(null)
      router.push(`/dashboard/messages?conversationId=${encodeURIComponent(conversation.id)}`)
    } catch (e: any) {
      toast({ title: t('toast.error'), description: e?.message || 'Errore contatto', variant: 'destructive' })
    } finally {
      setContacting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <span className="text-sm text-gray-500">{t('map.loading')}</span>
        </div>
      </div>
    )
  }

  const canCreateMarker = session?.user?.role === 'RECRUITER' || session?.user?.role === 'ARTIST' || session?.user?.role === 'ARTIST_RECRUITER'

  return (
    <div className="relative w-full h-[calc(100vh-6rem)] flex flex-col">
      {/* TOP BAR - Compact */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl px-3 py-2.5 border-b border-gray-200/50 dark:border-gray-700/50 z-20">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              data-guide="map-search"
              type="text"
              placeholder={t('map.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-9 pr-4 py-2 text-sm border-0 focus:ring-2 focus:ring-sky-500/30 outline-none"
            />
          </div>

          {/* Filters - inline */}
          <div className="hidden md:flex items-center gap-1.5">
            <FilterChip active={filterKind === 'opportunity'} onClick={() => setFilterKind(filterKind === 'opportunity' ? 'all' : 'opportunity')}>
              Opportunità
            </FilterChip>
            <FilterChip active={filterKind === 'collaboration'} onClick={() => setFilterKind(filterKind === 'collaboration' ? 'all' : 'collaboration')}>
              Collaborazione
            </FilterChip>
            <FilterChip active={filterKind === 'events'} onClick={() => setFilterKind(filterKind === 'events' ? 'all' : 'events')}>
              Eventi
            </FilterChip>
            <select
              value={artTag}
              onChange={(e) => setArtTag(e.target.value)}
              className="h-8 px-2 rounded-full bg-gray-100 dark:bg-gray-800 text-xs border-0 focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="all">🎨 Tutti</option>
              <option value="danza">💃 Danza</option>
              <option value="canto">🎤 Canto</option>
              <option value="teatro">🎭 Teatro</option>
              <option value="musica">🎵 Musica</option>
              <option value="fotografia">📷 Foto</option>
              <option value="pittura">🖼️ Pittura</option>
            </select>
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="md:hidden p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <SlidersHorizontal size={18} />
          </button>

          {/* New marker button */}
          {canCreateMarker && (
            <button
              data-guide="map-new-marker"
              onClick={() => {
                setShowNewPost(true)
                setSelectedLocation(null)
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Nuovo</span>
            </button>
          )}
        </div>

        {/* Mobile chips row */}
        <div className="md:hidden mt-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <FilterChip active={filterKind === 'opportunity'} onClick={() => setFilterKind(filterKind === 'opportunity' ? 'all' : 'opportunity')}>
            Opportunità
          </FilterChip>
          <FilterChip active={filterKind === 'collaboration'} onClick={() => setFilterKind(filterKind === 'collaboration' ? 'all' : 'collaboration')}>
            Collaborazione
          </FilterChip>
          <FilterChip active={filterKind === 'events'} onClick={() => setFilterKind(filterKind === 'events' ? 'all' : 'events')}>
            Eventi
          </FilterChip>
          <select
            value={artTag}
            onChange={(e) => setArtTag(e.target.value)}
            className="shrink-0 h-7 px-2 rounded-full bg-gray-100 dark:bg-gray-800 text-xs border-0"
          >
            <option value="all">🎨 Tag</option>
            <option value="danza">💃</option>
            <option value="canto">🎤</option>
            <option value="teatro">🎭</option>
            <option value="musica">🎵</option>
          </select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-1.5 text-[11px] text-gray-500">
          <span>{filteredEvents.length} risultati</span>
          {(filterKind !== 'all' || artTag !== 'all' || searchQuery) && (
            <button
              type="button"
              className="text-sky-500 hover:text-sky-600 font-medium"
              onClick={() => {
                setSearchQuery('')
                setFilterKind('all')
                setArtTag('all')
              }}
            >
              Pulisci filtri
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-[20px] p-4 pb-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4" />
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filtri</h3>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Tipo</label>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip active={filterKind === 'all'} onClick={() => setFilterKind('all')}>Tutti</FilterChip>
                    <FilterChip active={filterKind === 'opportunity'} onClick={() => setFilterKind('opportunity')}>Opportunità</FilterChip>
                    <FilterChip active={filterKind === 'collaboration'} onClick={() => setFilterKind('collaboration')}>Collaborazione</FilterChip>
                    <FilterChip active={filterKind === 'events'} onClick={() => setFilterKind('events')}>Eventi</FilterChip>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Categoria artistica</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'all', l: '🎨 Tutti' },
                      { v: 'danza', l: '💃 Danza' },
                      { v: 'canto', l: '🎤 Canto' },
                      { v: 'teatro', l: '🎭 Teatro' },
                      { v: 'musica', l: '🎵 Musica' },
                      { v: 'fotografia', l: '📷 Foto' },
                    ].map((t) => (
                      <button
                        key={t.v}
                        onClick={() => setArtTag(t.v)}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium transition-colors",
                          artTag === t.v
                            ? "bg-sky-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-full"
                    onClick={() => { setFilterKind('all'); setArtTag('all') }}
                  >
                    Reset
                  </Button>
                  <Button className="flex-1 rounded-full" onClick={() => setShowFilters(false)}>
                    Applica
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN LAYOUT */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* MAP */}
        <div className="flex-1 relative">
          <Map 
            events={filteredEvents} 
            onEventClick={(event) => setSelectedEvent(event)}
            onMapClick={handleMapClick}
            locale={language === 'it' ? 'it-IT' : 'en-US'}
          />
          
          {/* Hint tooltip */}
          {canCreateMarker && !showNewPost && !selectedEvent && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs text-gray-600 dark:text-gray-400 z-10">
              👆 {t('map.clickToAdd')}
            </div>
          )}
        </div>

        {/* Side Panel - New Post */}
        <AnimatePresence>
          {showNewPost && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute md:relative right-0 top-0 bottom-0 w-full md:w-[340px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-30 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <h2 className="font-semibold text-gray-900 dark:text-white">{t('map.newMarker')}</h2>
                <button 
                  onClick={() => { setShowNewPost(false); setSelectedLocation(null) }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <NewPostForm onSubmit={addNewMarker} selectedLocation={selectedLocation} t={t} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side Panel - Event Detail */}
        <AnimatePresence>
          {selectedEvent && !showNewPost && (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute md:relative right-0 top-0 bottom-0 w-full md:w-[380px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 z-30 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900 dark:text-white truncate">{selectedEvent.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-medium',
                      (selectedEvent.type || '').toUpperCase() === 'COLLABORATION'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                    )}>
                      {(selectedEvent.type || '').toUpperCase() === 'COLLABORATION' ? 'Collab' : 'Evento'}
                    </span>
                    {selectedEvent.city && (
                      <span className="text-xs text-gray-500">{selectedEvent.city}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <MarkerGallery
                  title={selectedEvent.title}
                  latitude={selectedEvent.latitude}
                  longitude={selectedEvent.longitude}
                  imageUrl={selectedEvent.imageUrl || undefined}
                />

                <div className="px-4 space-y-4">
                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-medium">
                      {selectedEvent.recruiter.name?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedEvent.recruiter.name || t('map.detail.organizer')}</p>
                      <p className="text-xs text-gray-500">Organizzatore</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-6">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(selectedEvent.startDate).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{selectedEvent.latitude.toFixed(4)}, {selectedEvent.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                {session?.user?.role === 'ARTIST' && (
                  <Button className="flex-1 rounded-full">
                    {t('map.detail.apply')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={contacting}
                  onClick={() => handleContact(selectedEvent)}
                  className="flex-1 rounded-full"
                >
                  {contacting ? 'Invio…' : t('map.detail.contact')}
                </Button>
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
  const [approxMeters, setApproxMeters] = useState<number | null>(null)
  const [streetStatus, setStreetStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!mapillaryToken) {
        setStreetShots([])
        setApproxMeters(null)
        setStreetStatus('idle')
        return
      }

      setStreetStatus('loading')
      try {
        // Progressive fallback: expand bbox until we find photos.
        // NOTE: this makes images more likely to show, but less precise.
        const steps = [0.001, 0.003, 0.01, 0.03, 0.08] // ~100m .. ~9km
        let found: string[] = []
        let used = steps[0]

        for (const d of steps) {
          const minLon = longitude - d
          const minLat = latitude - d
          const maxLon = longitude + d
          const maxLat = latitude + d

          const url =
            `https://graph.mapillary.com/images` +
            `?fields=id,thumb_1024_url` +
            `&bbox=${minLon},${minLat},${maxLon},${maxLat}` +
            `&limit=20` +
            `&access_token=${encodeURIComponent(mapillaryToken)}`

          const res = await fetch(url)
          if (!res.ok) continue
          const json = await res.json()
          const urls = (json?.data || [])
            .map((x: any) => x?.thumb_1024_url)
            .filter(Boolean)
            .slice(0, 3)

          if (urls.length > 0) {
            found = urls
            used = d
            break
          }
        }

        if (cancelled) return
        setStreetShots(found)
        setApproxMeters(found.length > 0 ? Math.round(steps.find((s) => s === used)! * 111000) : null)
        setStreetStatus(found.length > 0 ? 'ready' : 'error')
      } catch (e) {
        if (cancelled) return
        setStreetShots([])
        setApproxMeters(null)
        setStreetStatus('error')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [latitude, longitude, mapillaryToken])

  useEffect(() => {
    setIdx(0)
  }, [latitude, longitude])

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
    <div className="relative">
      <div className="aspect-video bg-gray-100 dark:bg-gray-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIdx((v) => Math.max(0, v - 1))}
              disabled={!canPrev}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                canPrev
                  ? "bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white hover:bg-white"
                  : "bg-white/40 text-gray-400 cursor-not-allowed"
              )}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setIdx((v) => Math.min(images.length - 1, v + 1))}
              disabled={!canNext}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                canNext
                  ? "bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white hover:bg-white"
                  : "bg-white/40 text-gray-400 cursor-not-allowed"
              )}
            >
              ›
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all",
                    i === idx ? "bg-white w-4" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Caption */}
      <div className="px-4 py-2 text-[10px] text-gray-400 flex items-center justify-between">
        <span>{labelForIdx(idx)}</span>
        {streetStatus === 'loading' && <Loader2 className="h-3 w-3 animate-spin" />}
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
  const { toast } = useToast()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !city || !lat || !lng) return
    let imageUrl: string | null = null
    if (imageFile) {
      setUploadingImage(true)
      try {
        const prepared = await prepareMediaForUpload(imageFile, 'events')
        const fd = new FormData()
        fd.append('file', prepared)
        fd.append('folder', 'events')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err?.error || 'Errore upload immagine')
        }
        const data = await res.json()
        imageUrl = data.url
      } catch (err) {
        toast({
          title: t('toast.error'),
          description: err instanceof Error ? err.message : 'Errore upload immagine',
          variant: 'destructive',
        })
        setUploadingImage(false)
        return
      } finally {
        setUploadingImage(false)
      }
    }

    onSubmit({ title, description, type, city, lat: parseFloat(lat), lng: parseFloat(lng), images: imageUrl ? [imageUrl] : [] })
    setTitle("")
    setDescription("")
    setCity("")
    setLocationSearch("")
    setLat("")
    setLng("")
    setType("opportunity")
    setShowLocationResults(false)
    setImageFile(null)
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

      <div className="space-y-1">
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="border-2 border-sky-200 dark:border-sky-800 bg-white dark:bg-gray-900 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-sky-500 file:to-blue-600 file:text-white hover:file:from-sky-600 hover:file:to-blue-700 file:cursor-pointer"
        />
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Foto marker (opzionale): JPG/PNG/WebP • max 6MB • ottimizzata automaticamente.
        </div>
      </div>
      <Button
        type="submit"
        disabled={uploadingImage}
        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-sky-500/30 transition-all hover:scale-105 font-semibold"
      >
        {uploadingImage ? 'Caricamento…' : t('map.marker.create')}
      </Button>
    </form>
  )
}
