import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updateQuestProgress } from '@/lib/quests'
import { createPostSchema, validateData } from '@/lib/validations'

export const dynamic = 'force-dynamic'

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
        where: {
          isDraft: false,
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } },
          ],
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
              role: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          reactions: {
            select: {
              emoji: true,
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
          poll: {
            include: {
              options: {
                include: {
                  _count: { select: { votes: true } },
                },
              },
            },
          },
          _count: {
            select: { reposts: true },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.post.count({
        where: {
          isDraft: false,
          OR: [
            { scheduledFor: null },
            { scheduledFor: { lte: new Date() } },
          ],
        },
      }),
    ])

    const formattedPosts = posts.map((post: typeof posts[0]) => {
      // Group reactions by emoji
      const reactionCounts = new Map<string, number>()
      post.reactions.forEach((r: { emoji: string }) => {
        reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) || 0) + 1)
      })
      
      return {
        id: post.id,
        content: post.content,
        images: post.images,
        tags: post.tags || [],
        author: post.author,
        createdAt: post.createdAt,
        isPinned: post.isPinned,
        viewsCount: post.viewsCount,
        likes: post.likes.length,
        comments: post.comments.length,
        reposts: post._count.reposts,
        reactions: Array.from(reactionCounts.entries()).map(([emoji, count]) => ({ emoji, count })),
        userReactions: userId 
          ? post.reactions.filter((r: { userId: string }) => r.userId === userId).map((r: { emoji: string }) => r.emoji) 
          : [],
        liked: userId ? post.likes.some((like: { userId: string }) => like.userId === userId) : false,
        saved: userId ? post.savedBy.some((saved: { userId: string }) => saved.userId === userId) : false,
        hasPoll: !!post.poll,
      }
    })

    const response = NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    })
    
    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30')
    
    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', { message: errorMessage, stack: errorStack })
    
    return NextResponse.json(
      { 
        error: 'Errore nel caricamento dei post',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage, stack: errorStack })
      },
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
    
    // Validate input with Zod
    const validation = validateData(createPostSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { content, images, type, tags } = validation.data
    const { poll, scheduledFor, isDraft } = body // Additional optional fields

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        images: images,
        tags: tags,
        type: type,
        authorId: session.user.id,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        isDraft: isDraft || false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            role: true,
          },
        },
      },
    })

    // Create poll if provided
    if (poll && poll.question && poll.options?.length >= 2) {
      await prisma.poll.create({
        data: {
          postId: post.id,
          question: poll.question,
          endsAt: poll.endsAt ? new Date(poll.endsAt) : null,
          options: {
            create: poll.options.map((text: string) => ({ text })),
          },
        },
      })
    }

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






