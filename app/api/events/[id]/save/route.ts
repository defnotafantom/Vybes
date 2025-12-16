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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Check if already saved
    const existingSave = await prisma.savedEvent.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingSave) {
      // Remove save
      await prisma.savedEvent.delete({
        where: { id: existingSave.id },
      })

      return NextResponse.json({ saved: false })
    }

    // Add save
    await prisma.savedEvent.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error('Error saving event:', error)
    return NextResponse.json(
      { error: 'Errore nel salvataggio dell\'evento' },
      { status: 500 }
    )
  }
}

