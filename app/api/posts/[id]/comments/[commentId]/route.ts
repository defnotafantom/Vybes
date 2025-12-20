import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { commentId } = params

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Commento non trovato' },
        { status: 404 }
      )
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo commento' },
        { status: 403 }
      )
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Errore eliminazione commento' },
      { status: 500 }
    )
  }
}





import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// DELETE a comment
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const { commentId } = params

    // Check if comment exists and belongs to user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })

    if (!comment) {
      return NextResponse.json(
        { error: 'Commento non trovato' },
        { status: 404 }
      )
    }

    if (comment.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato a eliminare questo commento' },
        { status: 403 }
      )
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Errore eliminazione commento' },
      { status: 500 }
    )
  }
}







