"use client"

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Trophy, Star, TrendingUp, Users, UserPlus, UserMinus, Calendar, CheckCircle, Clock, Bookmark, Plus, Edit, Image as ImageIcon, Video, FileText } from 'lucide-react'
import Image from 'next/image'
import { FittingRoomModal } from '@/components/profile/fitting-room-modal'
import { ProfileSkeleton } from '@/components/ui/skeleton'
import { ProfileEditModal } from '@/components/profile/profile-edit-modal'
import { Progress } from '@/components/ui/progress'
import { getExperienceProgress } from '@/lib/utils'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

interface UserProfile {
  id: string
  name: string | null
  email: string
  username: string | null
  bio: string | null
  image: string | null
  location?: string | null
  website?: string | null
  role: string
  level: number
  experience: number
  reputation: number
  followers: number
  following: number
  postsCount?: number
  portfolioCount?: number
  isFollowing?: boolean
  isOwnProfile?: boolean
}

interface Event {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  city: string
  recruiter: {
    name: string | null
  }
  participantsCount: number
  participantStatus?: string
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)
  const [eventsTab, setEventsTab] = useState<'completed' | 'ongoing' | 'saved' | 'created'>('completed')
  const [events, setEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [isFittingRoomOpen, setIsFittingRoomOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [portfolioItems, setPortfolioItems] = useState<any[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchEvents = useCallback(async () => {
    if (!profile?.isOwnProfile) return

    setLoadingEvents(true)
    try {
      const response = await fetch(`/api/user/events?type=${eventsTab}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoadingEvents(false)
    }
  }, [eventsTab, profile?.isOwnProfile])

  const fetchPortfolio = useCallback(async () => {
    if (profile?.role !== 'ARTIST' && profile?.role !== 'ARTIST_RECRUITER') return

    setLoadingPortfolio(true)
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setPortfolioItems(data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoadingPortfolio(false)
    }
  }, [profile?.role])

  useEffect(() => {
    if (profile?.isOwnProfile) {
      fetchEvents()
    }
    if (profile?.role === 'ARTIST' || profile?.role === 'ARTIST_RECRUITER') {
      fetchPortfolio()
    }
  }, [eventsTab, profile, fetchEvents, fetchPortfolio])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFollowing(data.isFollowing || false)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile || !session?.user?.id) return

    try {
      const response = await fetch(`/api/users/${profile.id}/follow`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setFollowing(data.following)
        fetchProfile() // Refresh to update follower count
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!profile) {
    return <div className="text-center py-12">Profilo non trovato</div>
  }

  const expProgress = getExperienceProgress(profile.experience)
  const expForNextLevel = profile.level * 100 - profile.experience

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32 ring-4 ring-sky-200 dark:ring-sky-800 shadow-lg">
              <AvatarImage src={profile.image || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    {profile.name || 'Utente'}
                  </h1>
                </div>
                {profile.isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Modifica</span>
                  </Button>
                )}
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 mt-1">@{profile.username || profile.email}</p>
                <span className="inline-block mt-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
                  {profile.role === 'ARTIST' ? '🎨 Artista' : profile.role === 'RECRUITER' ? '🎯 Recruiter' : profile.role === 'ARTIST_RECRUITER' ? '🎨🎯 Artista & Recruiter' : '👤 Visualizzatore'}
                </span>
              </div>
              {profile.bio && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
              )}
              {(profile.location || profile.website) && (
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      📍 {profile.location}
                    </span>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors underline"
                    >
                      🔗 {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 md:gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{profile.followers}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Seguaci</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{profile.following}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Seguiti</div>
                </div>
                {profile.postsCount !== undefined && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{profile.postsCount}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Post</div>
                  </div>
                )}
                {profile.portfolioCount !== undefined && (profile.role === 'ARTIST' || profile.role === 'ARTIST_RECRUITER') && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{profile.portfolioCount}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Portfolio</div>
                  </div>
                )}
                {!profile.isOwnProfile && (
                  <Button
                    onClick={handleFollow}
                    className={`ml-auto bg-gradient-to-r ${
                      following
                        ? 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
                        : 'from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                    } text-white font-semibold shadow-lg transition-all hover:scale-105`}
                  >
                    {following ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Smetti di seguire
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Segui
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Livello {profile.level}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{profile.experience} XP</div>
            <Progress value={expProgress} className="h-3 bg-yellow-100 dark:bg-yellow-900/30" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {expForNextLevel} XP per il livello {profile.level + 1}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <Star className="h-6 w-6 text-blue-500 fill-blue-500" />
              Reputazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{profile.reputation}</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Punti reputazione</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <TrendingUp className="h-6 w-6 text-green-500" />
              Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{Math.round(expProgress)}%</div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Verso il prossimo livello</p>
          </CardContent>
        </Card>
      </div>

      {/* Avatar & Personalization - Only for own profile */}
      {profile.isOwnProfile && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800 shadow-lg hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-indigo-100/50 to-purple-100/50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-xl">
            <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🎨</span>
              Personalizza Avatar
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Personalizza il tuo avatar 3D con outfit e accessori
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              onClick={() => setIsFittingRoomOpen(true)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105"
            >
              Apri Fitting Room
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Portfolio - Only for artists */}
      {(profile.role === 'ARTIST' || profile.role === 'ARTIST_RECRUITER') && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-500" />
                  Portfolio
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Le tue opere d&apos;arte
                </CardDescription>
              </div>
              {profile.isOwnProfile && (
                <Link href="/dashboard/portfolio/create">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Opera
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingPortfolio ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">Caricamento portfolio...</div>
            ) : portfolioItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-6">
                  <ImageIcon className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                  {profile.isOwnProfile ? 'Il tuo portfolio è vuoto' : 'Il portfolio è vuoto'}
                </p>
                {profile.isOwnProfile && (
                  <Link href="/dashboard/portfolio/create">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30">
                      <Plus className="h-4 w-4 mr-2" />
                      Aggiungi la tua prima opera
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {portfolioItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                  >
                    {item.imageUrl && (
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    {item.videoUrl && (
                      <div className="aspect-video relative">
                        <video
                          src={item.videoUrl}
                          controls
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                      </div>
                    )}
                    {!item.imageUrl && !item.videoUrl && (
                      <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                        {item.type === 'TEXT' ? (
                          <FileText className="h-12 w-12 text-purple-400" />
                        ) : item.type === 'VIDEO' ? (
                          <Video className="h-12 w-12 text-purple-400" />
                        ) : (
                          <ImageIcon className="h-12 w-12 text-purple-400" />
                        )}
                      </div>
                    )}
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                      <CardTitle className="text-lg text-slate-800 dark:text-slate-100">{item.title}</CardTitle>
                      {item.description && (
                        <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                          {item.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {item.tags && item.tags.length > 0 && (
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Events Recap - Only for own profile */}
      {profile.isOwnProfile && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-sky-500" />
                  I Miei Eventi
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  Gestisci i tuoi eventi e partecipazioni
                </CardDescription>
              </div>
              {profile.role === 'RECRUITER' && (
                <Link href="/dashboard/events/create">
                  <Button size="sm" className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crea Evento
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-sky-200 dark:border-sky-800 overflow-x-auto">
              {(profile.role === 'ARTIST' || profile.role === 'ARTIST_RECRUITER') && (
                <>
                  <button
                    onClick={() => setEventsTab('completed')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap ${
                      eventsTab === 'completed'
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                    }`}
                  >
                    <CheckCircle className="h-4 w-4 inline mr-2" />
                    Completati
                  </button>
                  <button
                    onClick={() => setEventsTab('ongoing')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap ${
                      eventsTab === 'ongoing'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                    }`}
                  >
                    <Clock className="h-4 w-4 inline mr-2" />
                    In Corso
                  </button>
                  <button
                    onClick={() => setEventsTab('saved')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap ${
                      eventsTab === 'saved'
                        ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                    }`}
                  >
                    <Bookmark className="h-4 w-4 inline mr-2" />
                    Salvati
                  </button>
                </>
              )}
              {profile.role === 'RECRUITER' && (
                <button
                  onClick={() => setEventsTab('created')}
                  className={`px-4 py-2 font-semibold border-b-2 transition-all whitespace-nowrap ${
                    eventsTab === 'created'
                      ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400'
                  }`}
                >
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Creati
                </button>
              )}
            </div>

            {/* Events List */}
            {loadingEvents ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">Caricamento eventi...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                {eventsTab === 'completed' && 'Nessun evento completato'}
                {eventsTab === 'ongoing' && 'Nessun evento in corso'}
                {eventsTab === 'saved' && 'Nessun evento salvato'}
                {eventsTab === 'created' && 'Nessun evento creato'}
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/dashboard/events/${event.id}`}
                    className="block p-4 rounded-xl bg-sky-50/50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">{event.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">{event.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(event.startDate).toLocaleDateString('it-IT')}
                          </span>
                          <span>{event.city}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.participantsCount} partecipanti
                          </span>
                          {event.participantStatus && (
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              event.participantStatus === 'ACCEPTED'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : event.participantStatus === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {event.participantStatus}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        event.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : event.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fitting Room Modal */}
      <FittingRoomModal 
        isOpen={isFittingRoomOpen} 
        onClose={() => setIsFittingRoomOpen(false)} 
      />

      {/* Profile Edit Modal */}
      {profile && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onSave={fetchProfile}
        />
      )}
    </div>
  )
}


    </div>
  )
}

