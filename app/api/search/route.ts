import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, users, posts, events

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        users: [],
        posts: [],
        events: [],
      })
    }

    const searchTerm = query.trim().toLowerCase()

    const results: {
      users: any[]
      posts: any[]
      events: any[]
    } = {
      users: [],
      posts: [],
      events: [],
    }

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { bio: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          role: true,
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
        take: 10,
      })

      results.users = users.map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        role: user.role,
        followers: user._count.followers,
        following: user._count.following,
      }))
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: searchTerm, mode: 'insensitive' } },
            { tags: { has: searchTerm } },
          ],
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
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      })

      results.posts = posts.map((post) => ({
        id: post.id,
        content: post.content.substring(0, 200),
        images: post.images,
        tags: post.tags,
        author: post.author,
        likes: post._count.likes,
        comments: post._count.comments,
        createdAt: post.createdAt,
      }))
    }

    // Search events
    if (type === 'all' || type === 'events') {
      const events = await prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { city: { contains: searchTerm, mode: 'insensitive' } },
            { type: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          recruiter: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      })

      results.events = events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description.substring(0, 200),
        type: event.type,
        city: event.city,
        startDate: event.startDate,
        imageUrl: event.imageUrl,
        recruiter: event.recruiter,
        participantsCount: event._count.participants,
        status: event.status,
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Errore nella ricerca' },
      { status: 500 }
    )
  }
}

