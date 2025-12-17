"use client"

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users, Clock, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'

interface Event {
  id: string
  title: string
  description: string
  type: string
  status: string
  startDate: string
  endDate?: string | null
  address: string
  city: string
  recruiter: {
    name: string | null
  }
  participants: number
}

export default function EventsPage() {
  const { data: session } = useSession()
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'completed' | 'saved'>('upcoming')
  const [loading, setLoading] = useState(true)

  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchEvents = useCallback(async (page: number = 1) => {
    try {
      const response = await fetch(`/api/events?status=${activeTab}&page=${page}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setEvents(data.events || [])
        } else {
          setEvents((prev) => [...prev, ...(data.events || [])])
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    setCurrentPage(1)
    fetchEvents(1)
  }, [activeTab, fetchEvents])

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000 &&
        hasMore &&
        !loading
      ) {
        const nextPage = currentPage + 1
        setCurrentPage(nextPage)
        fetchEvents(nextPage)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loading, currentPage, fetchEvents])

  const tabs = [
    { id: 'upcoming', label: t('events.upcoming') },
    { id: 'active', label: t('events.active') },
    { id: 'completed', label: t('events.completed') },
    { id: 'saved', label: t('events.saved') },
  ]

  if (loading) {
    return <div className="text-center py-12">{t('events.loadingPage')}</div>
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('events.pageTitle')}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t('events.pageSubtitle')}
          </p>
        </div>
        {session?.user?.role === 'RECRUITER' && (
          <Link href="/dashboard/events/create">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('events.createCta')}
            </Button>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-sky-200 dark:border-sky-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 font-semibold border-b-2 transition-all duration-200 ${
              activeTab === tab.id
                ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-900/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              {t('events.empty')}
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <Card 
              key={event.id} 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-slate-800 dark:text-slate-100">{event.title}</CardTitle>
                    <CardDescription className="mt-1 text-slate-600 dark:text-slate-400">{event.type}</CardDescription>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
                    {event.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm line-clamp-2 text-slate-600 dark:text-slate-300">{event.description}</p>
                
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-sky-500" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString('it-IT', {
                        // locale set below
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-sky-500" />
                    <span>{event.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-500" />
                    <span>{event.participants} {t('events.participantsCount')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-sky-500" />
                    <span>
                      {formatDistanceToNow(new Date(event.startDate), {
                        addSuffix: true,
                        locale: language === 'it' ? it : undefined,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-2 border-sky-300 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-500 dark:hover:border-sky-500 transition-all">
                      {t('events.detail')}
                    </Button>
                  </Link>
                  {session?.user?.role === 'ARTIST' && (
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/events/${event.id}/participate`, {
                            method: 'POST',
                          })
                          if (response.ok) {
                            fetchEvents()
                          }
                        } catch (error) {
                          console.error('Error participating:', error)
                        }
                      }}
                      className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30 transition-all"
                    >
                      {t('events.participate')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

