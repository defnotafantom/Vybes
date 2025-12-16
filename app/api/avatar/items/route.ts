import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Lista items disponibili (con ownership status)
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

    // Get all available items
    const items = await prisma.avatarItem.findMany({
      where: {
        available: true,
        ...(category ? { category } : {}),
      },
      orderBy: [
        { rarity: 'asc' },
        { priceCoins: 'asc' },
        { name: 'asc' },
      ],
    })

    // Get user's owned items
    const ownedItems = await prisma.userAvatarItem.findMany({
      where: { userId: session.user.id },
      select: { itemId: true },
    })

    const ownedItemIds = new Set(ownedItems.map(oi => oi.itemId))

    // Add ownership status to items
    const itemsWithOwnership = items.map(item => ({
      ...item,
      owned: ownedItemIds.has(item.id),
    }))

    return NextResponse.json({ items: itemsWithOwnership })
  } catch (error) {
    console.error('Error fetching avatar items:', error)
    return NextResponse.json(
      { error: 'Errore nel caricamento degli items' },
      { status: 500 }
    )
  }
}

