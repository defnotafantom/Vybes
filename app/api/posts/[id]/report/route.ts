import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    const body = await request.json()
    const { reason } = body

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trovato' },
        { status: 404 }
      )
    }

    // Can't report own post
    if (post.authorId === session.user.id) {
      return NextResponse.json(
        { error: 'Non puoi segnalare il tuo stesso post' },
        { status: 400 }
      )
    }

    // For now, just log the report (in production you'd save to DB)
    console.log('Post reported:', {
      postId: params.id,
      reportedBy: session.user.id,
      reason: reason || 'Non specificato',
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Segnalazione inviata con successo' 
    })
  } catch (error) {
    console.error('Error reporting post:', error)
    return NextResponse.json(
      { error: 'Errore durante la segnalazione' },
      { status: 500 }
    )
  }
}


