import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all active stories
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get stories that haven't expired
    const now = new Date()
    
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        views: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group stories by user
    const groupedMap = new Map<string, {
      userId: string
      user: typeof stories[0]['author']
      stories: typeof stories
      hasUnviewed: boolean
    }>()

    stories.forEach((story) => {
      const existing = groupedMap.get(story.authorId)
      const hasViewed = userId ? story.views.some(v => v.userId === userId) : true

      if (existing) {
        existing.stories.push(story)
        if (!hasViewed) existing.hasUnviewed = true
      } else {
        groupedMap.set(story.authorId, {
          userId: story.authorId,
          user: story.author,
          stories: [story],
          hasUnviewed: !hasViewed,
        })
      }
    })

    // Sort: unviewed first, then by most recent
    const grouped = Array.from(groupedMap.values()).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1
      if (!a.hasUnviewed && b.hasUnviewed) return 1
      return new Date(b.stories[0].createdAt).getTime() - new Date(a.stories[0].createdAt).getTime()
    })

    return NextResponse.json({ stories: grouped })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST create new story
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { mediaUrl, mediaType, caption } = await request.json()

    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ error: 'Media richiesto' }, { status: 400 })
    }

    // Stories expire after 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        authorId: session.user.id,
        mediaUrl,
        mediaType,
        caption: caption || null,
        expiresAt,
      },
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}





import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all active stories
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get stories that haven't expired
    const now = new Date()
    
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: { gt: now },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
        views: {
          select: { userId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Group stories by user
    const groupedMap = new Map<string, {
      userId: string
      user: typeof stories[0]['author']
      stories: typeof stories
      hasUnviewed: boolean
    }>()

    stories.forEach((story) => {
      const existing = groupedMap.get(story.authorId)
      const hasViewed = userId ? story.views.some(v => v.userId === userId) : true

      if (existing) {
        existing.stories.push(story)
        if (!hasViewed) existing.hasUnviewed = true
      } else {
        groupedMap.set(story.authorId, {
          userId: story.authorId,
          user: story.author,
          stories: [story],
          hasUnviewed: !hasViewed,
        })
      }
    })

    // Sort: unviewed first, then by most recent
    const grouped = Array.from(groupedMap.values()).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1
      if (!a.hasUnviewed && b.hasUnviewed) return 1
      return new Date(b.stories[0].createdAt).getTime() - new Date(a.stories[0].createdAt).getTime()
    })

    return NextResponse.json({ stories: grouped })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST create new story
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const { mediaUrl, mediaType, caption } = await request.json()

    if (!mediaUrl || !mediaType) {
      return NextResponse.json({ error: 'Media richiesto' }, { status: 400 })
    }

    // Stories expire after 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const story = await prisma.story.create({
      data: {
        authorId: session.user.id,
        mediaUrl,
        mediaType,
        caption: caption || null,
        expiresAt,
      },
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}







