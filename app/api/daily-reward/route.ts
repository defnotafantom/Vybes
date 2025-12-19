import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Default daily rewards
const DEFAULT_REWARDS = [
  { day: 1, xpReward: 10, coinReward: 5 },
  { day: 2, xpReward: 15, coinReward: 10 },
  { day: 3, xpReward: 20, coinReward: 15 },
  { day: 4, xpReward: 25, coinReward: 20 },
  { day: 5, xpReward: 35, coinReward: 30 },
  { day: 6, xpReward: 50, coinReward: 40 },
  { day: 7, xpReward: 100, coinReward: 75 },
]

// GET daily reward status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const lastReward = await prisma.userDailyReward.findFirst({
      where: { userId: session.user.id },
      orderBy: { claimedAt: 'desc' },
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let canClaim = true
    let currentStreak = 1
    let nextRewardDay = 1

    if (lastReward) {
      const lastClaimDate = new Date(lastReward.claimedAt)
      const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate())
      
      // Check if already claimed today
      if (lastClaimDay.getTime() === today.getTime()) {
        canClaim = false
        currentStreak = lastReward.streak
        nextRewardDay = lastReward.lastClaimDay
      } else {
        // Check if streak continues (claimed yesterday)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (lastClaimDay.getTime() === yesterday.getTime()) {
          currentStreak = lastReward.streak + 1
          nextRewardDay = ((lastReward.lastClaimDay) % 7) + 1
        } else {
          // Streak broken, reset
          currentStreak = 1
          nextRewardDay = 1
        }
      }
    }

    const rewards = DEFAULT_REWARDS.map(r => ({
      ...r,
      isCurrent: r.day === nextRewardDay,
      isClaimed: !canClaim && r.day === nextRewardDay,
    }))

    return NextResponse.json({
      canClaim,
      currentStreak,
      nextRewardDay,
      rewards,
      nextReward: rewards.find(r => r.day === nextRewardDay),
    })
  } catch (error) {
    console.error('Error fetching daily reward:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}

// POST claim daily reward
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const lastReward = await prisma.userDailyReward.findFirst({
      where: { userId: session.user.id },
      orderBy: { claimedAt: 'desc' },
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Check if already claimed today
    if (lastReward) {
      const lastClaimDate = new Date(lastReward.claimedAt)
      const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate())
      
      if (lastClaimDay.getTime() === today.getTime()) {
        return NextResponse.json({ error: 'Già riscattato oggi' }, { status: 400 })
      }
    }

    // Calculate streak and reward day
    let streak = 1
    let rewardDay = 1

    if (lastReward) {
      const lastClaimDate = new Date(lastReward.claimedAt)
      const lastClaimDay = new Date(lastClaimDate.getFullYear(), lastClaimDate.getMonth(), lastClaimDate.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (lastClaimDay.getTime() === yesterday.getTime()) {
        streak = lastReward.streak + 1
        rewardDay = ((lastReward.lastClaimDay) % 7) + 1
      }
    }

    const reward = DEFAULT_REWARDS.find(r => r.day === rewardDay) || DEFAULT_REWARDS[0]

    // Create reward record
    await prisma.userDailyReward.create({
      data: {
        userId: session.user.id,
        streak,
        lastClaimDay: rewardDay,
      },
    })

    // Update user XP and coins
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        experience: { increment: reward.xpReward },
        coins: { increment: reward.coinReward },
      },
    })

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'daily_reward',
        amount: reward.coinReward,
        description: `Premio giornaliero giorno ${rewardDay} (${reward.xpReward} XP, ${reward.coinReward} monete)`,
      },
    })

    return NextResponse.json({
      success: true,
      reward,
      newStreak: streak,
    })
  } catch (error) {
    console.error('Error claiming daily reward:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}





