"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

interface Participant {
  id: string
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio: string | null
  }
  status: string
  createdAt: string
}

interface Event {
  id: string
  title: string
  recruiterId: string
}

export default function ManageEventPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchEventData()
    }
  }, [params.id])

  const fetchEventData = async () => {
    try {
      const eventResponse = await fetch(`/api/events/${params.id}`)
      if (eventResponse.ok) {
        const eventData = await eventResponse.json()
        setEvent(eventData)
        
        // Check if user is the recruiter
        if (eventData.recruiter.id !== session?.user?.id) {
          router.push(`/dashboard/events/${params.id}`)
          return
        }
      }

      // Fetch participants
      const participantsResponse = await fetch(`/api/events/${params.id}/participants`)
      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json()
        setParticipants(participantsData)
      }
    } catch (error) {
      console.error('Error fetching event data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (participantId: string, newStatus: 'ACCEPTED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/events/${params.id}/participants/${participantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchEventData()
      }
    } catch (error) {
      console.error('Error updating participant status:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Caricamento...</div>
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Evento non trovato</p>
        <Button onClick={() => router.back()}>Torna indietro</Button>
      </div>
    )
  }

  const pendingParticipants = participants.filter((p) => p.status === 'PENDING')
  const acceptedParticipants = participants.filter((p) => p.status === 'ACCEPTED')
  const rejectedParticipants = participants.filter((p) => p.status === 'REJECTED')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/events/${params.id}`)}
          className="hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna all&apos;Evento
        </Button>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Gestisci Partecipanti</CardTitle>
          <CardDescription>{event.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pending */}
          {pendingParticipants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Clock className="h-5 w-5 text-yellow-500" />
                In Attesa ({pendingParticipants.length})
              </h3>
              <div className="space-y-3">
                {pendingParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className="bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={participant.user.image || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                              {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100">
                              {participant.user.name || participant.user.username || 'Utente'}
                            </div>
                            {participant.user.bio && (
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {participant.user.bio}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {formatDistanceToNow(new Date(participant.createdAt), {
                                addSuffix: true,
                                locale: it,
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(participant.id, 'ACCEPTED')}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accetta
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(participant.id, 'REJECTED')}
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rifiuta
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Accepted */}
          {acceptedParticipants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Accettati ({acceptedParticipants.length})
              </h3>
              <div className="space-y-3">
                {acceptedParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className="bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={participant.user.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                            {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {participant.user.name || participant.user.username || 'Utente'}
                          </div>
                          {participant.user.bio && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {participant.user.bio}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rejected */}
          {rejectedParticipants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <XCircle className="h-5 w-5 text-red-500" />
                Rifiutati ({rejectedParticipants.length})
              </h3>
              <div className="space-y-3">
                {rejectedParticipants.map((participant) => (
                  <Card
                    key={participant.id}
                    className="bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={participant.user.image || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-600 text-white">
                            {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {participant.user.name || participant.user.username || 'Utente'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {participants.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              Nessun partecipante ancora
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

