"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { RoleBadge } from '@/components/ui/role-badge'
import { UserPlus, UserMinus, ArrowLeft } from 'lucide-react'

export default function PublicUserProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('Errore caricamento profilo')
        const data = await res.json()
        setUser(data)
        setFollowing(!!data.isFollowing)
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  const handleFollow = async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setFollowing(!!data.following)
      }
    } catch {}
  }

  if (loading) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">Caricamento…</div>
  if (!user) return <div className="text-center py-12 text-slate-600 dark:text-slate-400">Utente non trovato</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Link>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-28 w-28 ring-4 ring-sky-200 dark:ring-sky-800 shadow-lg">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-bold">
                {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 truncate">
                      {user.name || user.username || 'Utente'}
                    </h1>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 mt-1">@{user.username || user.email}</div>
                </div>
                {!user.isOwnProfile && (
                  <Button onClick={handleFollow} className="shrink-0" variant={following ? 'outline' : 'default'}>
                    {following ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Segui già
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

              {user.bio && <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{user.bio}</div>}

              <div className="flex flex-wrap gap-6 text-sm text-slate-600 dark:text-slate-400 pt-2">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{user.followers ?? 0}</div>
                  <div>Seguaci</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{user.following ?? 0}</div>
                  <div>Seguiti</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">{user.postsCount ?? 0}</div>
                  <div>Post</div>
                </div>
                {(user.role === 'ARTIST' || user.role === 'ARTIST_RECRUITER') && (
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-100">{user.portfolioCount ?? 0}</div>
                    <div>Portfolio</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}












