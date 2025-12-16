import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Acquista un item avatar
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
    const { itemId } = body

    if (!itemId) {
      return NextResponse.json(
        { error: 'ID item richiesto' },
        { status: 400 }
      )
    }

    // Get item details
    const item = await prisma.avatarItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item non trovato' },
        { status: 404 }
      )
    }

    if (!item.available) {
      return NextResponse.json(
        { error: 'Item non disponibile' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { coins: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      )
    }

    // Check if already owned
    const existingOwnership = await prisma.userAvatarItem.findUnique({
      where: {
        userId_itemId: {
          userId: session.user.id,
          itemId: item.id,
        },
      },
    })

    if (existingOwnership) {
      return NextResponse.json(
        { error: 'Item già posseduto' },
        { status: 400 }
      )
    }

    // Check if user has enough coins
    if (user.coins < item.priceCoins) {
      return NextResponse.json(
        { error: 'Monete insufficienti', required: item.priceCoins, current: user.coins },
        { status: 400 }
      )
    }

    // Perform transaction (in a transaction to ensure atomicity)
    const result = await prisma.$transaction(async (tx) => {
      // Deduct coins
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: {
          coins: {
            decrement: item.priceCoins,
          },
        },
      })

      // Create ownership
      const ownership = await tx.userAvatarItem.create({
        data: {
          userId: session.user.id,
          itemId: item.id,
        },
        include: {
          item: true,
        },
      })

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'avatar_purchase',
          amount: -item.priceCoins,
          description: `Acquisto: ${item.name}`,
          metadata: JSON.stringify({ itemId: item.id, itemName: item.name }),
        },
      })

      return { ownership, coins: updatedUser.coins }
    })

    return NextResponse.json({
      message: 'Item acquistato con successo',
      ownership: result.ownership,
      coins: result.coins,
    })
  } catch (error: any) {
    console.error('Error purchasing avatar item:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Item già posseduto' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Errore nell\'acquisto dell\'item' },
      { status: 500 }
    )
  }
}

