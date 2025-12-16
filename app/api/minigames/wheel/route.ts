import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Spin the lucky wheel and get reward
export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    // Check if user has already spun today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastSpin = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        type: 'wheel_spin',
        createdAt: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (lastSpin) {
      const nextSpinTime = new Date(lastSpin.createdAt)
      nextSpinTime.setDate(nextSpinTime.getDate() + 1)
      nextSpinTime.setHours(0, 0, 0, 0)
      
      return NextResponse.json(
        { 
          error: 'Hai già girato la ruota oggi',
          nextSpinTime: nextSpinTime.toISOString(),
        },
        { status: 400 }
      )
    }

    // Define wheel segments with probabilities
    const segments = [
      { id: 1, coins: 5, probability: 0.35, label: '5 Monete', color: '#3b82f6' },
      { id: 2, coins: 10, probability: 0.25, label: '10 Monete', color: '#8b5cf6' },
      { id: 3, coins: 15, probability: 0.20, label: '15 Monete', color: '#ec4899' },
      { id: 4, coins: 20, probability: 0.12, label: '20 Monete', color: '#f59e0b' },
      { id: 5, coins: 50, probability: 0.05, label: '50 Monete', color: '#ef4444' },
      { id: 6, coins: 100, probability: 0.03, label: '100 Monete', color: '#10b981' },
    ]

    // Calculate cumulative probabilities
    let cumulative = 0
    const cumulativeProbs = segments.map(seg => {
      cumulative += seg.probability
      return { ...seg, cumulative }
    })

    // Spin the wheel
    const random = Math.random()
    const winner = cumulativeProbs.find(seg => random <= seg.cumulative) || cumulativeProbs[cumulativeProbs.length - 1]

    // Award coins
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        coins: {
          increment: winner.coins,
        },
      },
      select: {
        coins: true,
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'wheel_spin',
        amount: winner.coins,
        description: `Lucky Wheel: ${winner.label}`,
        metadata: JSON.stringify({ segmentId: winner.id, segmentLabel: winner.label }),
      },
    })

    return NextResponse.json({
      success: true,
      reward: {
        coins: winner.coins,
        label: winner.label,
        segmentId: winner.id,
        color: winner.color,
      },
      newCoins: updatedUser.coins,
    })
  } catch (error) {
    console.error('Error spinning wheel:', error)
    return NextResponse.json(
      { error: 'Errore nel girare la ruota' },
      { status: 500 }
    )
  }
}

// GET - Check if user can spin today
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastSpin = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        type: 'wheel_spin',
        createdAt: {
          gte: today,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (lastSpin) {
      const nextSpinTime = new Date(lastSpin.createdAt)
      nextSpinTime.setDate(nextSpinTime.getDate() + 1)
      nextSpinTime.setHours(0, 0, 0, 0)
      
      return NextResponse.json({
        canSpin: false,
        nextSpinTime: nextSpinTime.toISOString(),
      })
    }

    return NextResponse.json({
      canSpin: true,
    })
  } catch (error) {
    console.error('Error checking wheel spin:', error)
    return NextResponse.json(
      { error: 'Errore nel controllo della ruota' },
      { status: 500 }
    )
  }
}

