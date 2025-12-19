import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { updatePostSchema, validateData } from '@/lib/validations'

export const dynamic = 'force-dynamic'

// GET single post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const post = await prisma.post.findUnique({
      where: { id: params.id },
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
          select: { userId: true },
        },
        reactions: {
          select: { emoji: true, userId: true },
        },
        comments: {
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
          orderBy: { createdAt: 'asc' },
        },
        savedBy: {
          select: { userId: true },
        },
        poll: {
          include: {
            options: {
              include: { _count: { select: { votes: true } } },
            },
          },
        },
        _count: {
          select: { likes: true, comments: true, reposts: true },
        },
        collaborationArtists: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trovato' },
        { status: 404 }
      )
    }

    // Group reactions
    const reactionCounts = new Map<string, number>()
    post.reactions.forEach((r) => {
      reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) || 0) + 1)
    })

    return NextResponse.json({
      ...post,
      reactions: Array.from(reactionCounts.entries()).map(([emoji, count]) => ({ emoji, count })),
      userReactions: userId ? post.reactions.filter(r => r.userId === userId).map(r => r.emoji) : [],
      liked: userId ? post.likes.some(like => like.userId === userId) : false,
      saved: userId ? post.savedBy.some(saved => saved.userId === userId) : false,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento del post' },
      { status: 500 }
    )
  }
}

// UPDATE post
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post non trovato' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a modificare questo post' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validation = validateData(updatePostSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { content, images, tags, type } = validation.data

    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        ...(content && { content: content.trim() }),
        ...(images && { images }),
        ...(tags && { tags }),
        ...(type && { type }),
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

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Errore durante la modifica del post' },
      { status: 500 }
    )
  }
}

// DELETE post
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post non trovato' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo post' },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Post eliminato con successo' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { error: 'Errore durante l\'eliminazione del post' },
      { status: 500 }
    )
  }
}



