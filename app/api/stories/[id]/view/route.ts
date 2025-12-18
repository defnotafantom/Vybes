import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST mark story as viewed
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Check if already viewed
    const existing = await prisma.storyView.findUnique({
      where: {
        storyId_userId: {
          storyId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!existing) {
      await prisma.storyView.create({
        data: {
          storyId: params.id,
          userId: session.user.id,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking story as viewed:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}


