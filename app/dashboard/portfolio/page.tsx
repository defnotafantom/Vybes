"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Image as ImageIcon, Video, FileText } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLanguage } from '@/components/providers/language-provider'

interface PortfolioItem {
  id: string
  title: string
  description: string | null
  imageUrl: string | null
  videoUrl: string | null
  type: string
  tags: string[]
  createdAt: Date
}

export default function PortfolioPage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === 'ARTIST' || session?.user?.role === 'ARTIST_RECRUITER') {
      fetchPortfolio()
    }
  }, [session])

  const fetchPortfolio = async () => {
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'ARTIST' && session?.user?.role !== 'ARTIST_RECRUITER') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {t('portfolio.onlyArtists')}
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-12">{t('portfolio.loading')}</div>
  }

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
            {t('portfolio.title')}
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">
            {t('portfolio.description')}
          </p>
        </div>
        <Link href="/dashboard/portfolio/create">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30">
            <Plus className="h-4 w-4 mr-2" />
            {t('portfolio.add')}
          </Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 mb-6">
              <ImageIcon className="h-10 w-10 text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
              {t('portfolio.empty')}
            </p>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/30">
              <Plus className="h-4 w-4 mr-2" />
              {t('profile.portfolio.addFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-sky-100 dark:border-sky-900 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
            >
              {item.imageUrl && (
                <div className="aspect-square relative overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20">
                  {item.type === 'text' ? (
                    <FileText className="h-12 w-12 text-sky-400" />
                  ) : item.type === 'video' ? (
                    <Video className="h-12 w-12 text-sky-400" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-sky-400" />
                  )}
                </div>
              )}
              <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/30">
                <CardTitle className="text-lg text-slate-800 dark:text-slate-100">{item.title}</CardTitle>
                {item.description && (
                  <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </CardDescription>
                )}
              </CardHeader>
              {item.tags.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
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
    </div>
  )
}

