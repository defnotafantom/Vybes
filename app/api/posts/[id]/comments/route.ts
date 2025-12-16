import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// GET comments for a post
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei commenti' },
      { status: 500 }
    )
  }
}

// POST create a new comment
export async function POST(
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

    const postId = params.id
    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Il contenuto del commento è obbligatorio' },
        { status: 400 }
      )
    }

    // Get post author for notification
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: session.user.id,
        content: content.trim(),
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
      },
    })

    // Create notification for post author (if not commenting on own post)
    if (post && post.authorId !== session.user.id) {
      const commenter = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, username: true },
      })

      if (commenter) {
        await createNotification(
          post.authorId,
          'comment',
          'Nuovo Commento',
          `${commenter.name || commenter.username || 'Qualcuno'} ha commentato il tuo post`,
          `/dashboard#post-${postId}`
        )
      }
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del commento' },
      { status: 500 }
    )
  }
}

