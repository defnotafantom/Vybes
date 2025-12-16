import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quests'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          savedBy: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.post.count(),
    ])

    const formattedPosts = posts.map((post: typeof posts[0]) => ({
      id: post.id,
      content: post.content,
      images: post.images,
      tags: post.tags || [],
      author: post.author,
      createdAt: post.createdAt,
      likes: post.likes.length,
      comments: post.comments.length,
      liked: userId ? post.likes.some((like: { userId: string }) => like.userId === userId) : false,
      saved: userId ? post.savedBy.some((saved: { userId: string }) => saved.userId === userId) : false,
    }))

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento dei post' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { content, images, type, tags } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Il contenuto è richiesto' },
        { status: 400 }
      )
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: images || [],
        tags: tags || [],
        type: type || 'POST',
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    })

    // Update quest progress for first post
    await updateQuestProgress(session.user.id, 'first_post', true)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del post' },
      { status: 500 }
    )
  }
}

// Quest progress is now handled by lib/quests.ts

