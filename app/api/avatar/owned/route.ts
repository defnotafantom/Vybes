import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Lista items posseduti dall'utente
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
    const category = searchParams.get('category') // Opzionale: filtra per categoria

    const ownedItems = await prisma.userAvatarItem.findMany({
      where: {
        userId: session.user.id,
        ...(category
          ? {
              item: {
                category,
              },
            }
          : {}),
      },
      include: {
        item: true,
      },
      orderBy: {
        purchasedAt: 'desc',
      },
    })

    return NextResponse.json({ items: ownedItems.map(oi => oi.item) })
  } catch (error) {
    console.error('Error fetching owned avatar items:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento degli items posseduti' },
      { status: 500 }
    )
  }
}

