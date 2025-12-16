import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trovato' },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    })

    if (existingSave) {
      // Unsave
      await prisma.savedPost.delete({
        where: { id: existingSave.id },
      })
      return NextResponse.json({ saved: false })
    } else {
      // Save
      await prisma.savedPost.create({
        data: {
          postId,
          userId: session.user.id,
        },
      })
      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('Error toggling save:', error)
    return NextResponse.json(
      { error: 'Errore nel salvare/rimuovere il post' },
      { status: 500 }
    )
  }
}

