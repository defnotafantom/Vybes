"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, MapPin, Users, Clock, ArrowLeft, Bookmark, CheckCircle, XCircle, Clock as ClockIcon, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import Image from 'next/image'

interface EventDetail {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate?: string | null
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  imageUrl?: string | null
  requirements?: string | null
  compensation?: string | null
  maxParticipants?: number | null
  recruiter: {
    id: string
    name: string | null
    image: string | null
    username: string | null
    bio?: string | null
  }
  participants: Array<{
    id: string
    user: {
      id: string
      name: string | null
      image: string | null
      username: string | null
    }
    status: string
    createdAt: string
  }>
  participantsCount: number
  isParticipating: boolean
  participantStatus: string | null
  isSaved: boolean
  createdAt: string
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [participating, setParticipating] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setEvent(data)
        setParticipating(data.isParticipating)
      }
    } catch (error) {
      console.error('Error fetching event:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleParticipate = async () => {
    if (!event) return

    try {
      const response = await fetch(`/api/events/${event.id}/participate`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setParticipating(data.participating)
        fetchEvent() // Refresh event data
      }
    } catch (error) {
      console.error('Error participating:', error)
    }
  }

  const handleSave = async () => {
    if (!event) return

    setSaving(true)
    try {
      const response = await fetch(`/api/events/${event.id}/save`, {
        method: 'POST',
      })

      if (response.ok) {
        fetchEvent() // Refresh event data
      }
    } catch (error) {
      console.error('Error saving event:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Caricamento evento...</div>
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Evento non trovato</p>
        <Button onClick={() => router.back()}>Torna indietro</Button>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    PUBLISHED: 'bg-blue-500',
    IN_PROGRESS: 'bg-green-500',
    COMPLETED: 'bg-purple-500',
    CANCELLED: 'bg-red-500',
  }

  const participantStatusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    ACCEPTED: 'bg-green-500',
    REJECTED: 'bg-red-500',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 w-full px-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>
      </div>

      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Event Info */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl md:text-3xl">{event.title}</CardTitle>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${statusColors[event.status] || 'bg-gray-500'}`}>
                  {event.status}
                </span>
              </div>
              <CardDescription className="text-lg">{event.type}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Descrizione</h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Calendar className="h-5 w-5 text-sky-500" />
              <div>
                <div className="font-medium">Data Inizio</div>
                <div className="text-sm">
                  {new Date(event.startDate).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {event.endDate && (
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Calendar className="h-5 w-5 text-sky-500" />
                <div>
                  <div className="font-medium">Data Fine</div>
                  <div className="text-sm">
                    {new Date(event.endDate).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <MapPin className="h-5 w-5 text-sky-500" />
              <div>
                <div className="font-medium">Posizione</div>
                <div className="text-sm">{event.address}, {event.city}, {event.country}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <Users className="h-5 w-5 text-sky-500" />
              <div>
                <div className="font-medium">Partecipanti</div>
                <div className="text-sm">
                  {event.participantsCount}
                  {event.maxParticipants && ` / ${event.maxParticipants}`}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {event.requirements && (
            <div>
              <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Requisiti</h3>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{event.requirements}</p>
            </div>
          )}

          {/* Compensation */}
          {event.compensation && (
            <div>
              <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Compenso</h3>
              <p className="text-slate-700 dark:text-slate-300">{event.compensation}</p>
            </div>
          )}

          {/* Recruiter Info */}
          <div className="pt-4 border-t border-sky-200 dark:border-sky-800">
            <h3 className="font-semibold mb-3 text-slate-800 dark:text-slate-100">Organizzatore</h3>
            <div className="flex items-center gap-3">
              <Avatar className="ring-2 ring-sky-200 dark:ring-sky-800">
                <AvatarImage src={event.recruiter.image || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold">
                  {event.recruiter.name?.charAt(0).toUpperCase() || 'R'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-100">
                  {event.recruiter.name || event.recruiter.username || 'Recruiter'}
                </div>
                {event.recruiter.bio && (
                  <div className="text-sm text-slate-600 dark:text-slate-400">{event.recruiter.bio}</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-sky-200 dark:border-sky-800">
            {session?.user?.role === 'ARTIST' && (
              <Button
                onClick={handleParticipate}
                disabled={participating && event.participantStatus === 'ACCEPTED'}
                className={`flex-1 ${
                  participating
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700'
                } text-white shadow-lg`}
              >
                {participating
                  ? event.participantStatus === 'ACCEPTED'
                    ? 'Partecipazione Confermata'
                    : event.participantStatus === 'PENDING'
                    ? 'Richiesta Inviata'
                    : 'Rimuovi Partecipazione'
                  : 'Partecipa all\'Evento'}
              </Button>
            )}
            {session?.user?.id === event.recruiter.id && (
              <Button
                onClick={() => router.push(`/dashboard/events/${event.id}/manage`)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg"
              >
                <User className="h-4 w-4 mr-2" />
                Gestisci Partecipanti
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={saving}
              className={`flex-1 border-2 ${
                event.isSaved
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                  : 'border-sky-200 dark:border-sky-800'
              }`}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${event.isSaved ? 'fill-current' : ''}`} />
              {event.isSaved ? 'Salvato' : 'Salva Evento'}
            </Button>
          </div>

          {/* Participant Status */}
          {participating && event.participantStatus && (
            <div className={`p-4 rounded-xl ${
              event.participantStatus === 'ACCEPTED'
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : event.participantStatus === 'PENDING'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {event.participantStatus === 'ACCEPTED' && <CheckCircle className="h-5 w-5 text-green-500" />}
                {event.participantStatus === 'PENDING' && <ClockIcon className="h-5 w-5 text-yellow-500" />}
                {event.participantStatus === 'REJECTED' && <XCircle className="h-5 w-5 text-red-500" />}
                <span className="font-semibold">
                  {event.participantStatus === 'ACCEPTED' && 'La tua richiesta è stata accettata!'}
                  {event.participantStatus === 'PENDING' && 'La tua richiesta è in attesa di approvazione'}
                  {event.participantStatus === 'REJECTED' && 'La tua richiesta è stata rifiutata'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      {event.participants.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
          <CardHeader>
            <CardTitle>Partecipanti ({event.participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-sky-50/50 dark:bg-sky-900/20"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.user.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white text-sm">
                        {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {participant.user.name || participant.user.username || 'Utente'}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(participant.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${
                    participantStatusColors[participant.status] || 'bg-gray-500'
                  }`}>
                    {participant.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

