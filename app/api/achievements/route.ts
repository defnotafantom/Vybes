import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET user achievements
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })

    // Get user's unlocked achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: { achievementId: true, unlockedAt: true },
    })

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId))
    const unlockedMap = new Map(userAchievements.map(ua => [ua.achievementId, ua.unlockedAt]))

    const achievements = allAchievements.map(a => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: unlockedMap.get(a.id) || null,
    }))

    // Group by category
    const grouped = achievements.reduce((acc, a) => {
      if (!acc[a.category]) acc[a.category] = []
      acc[a.category].push(a)
      return acc
    }, {} as Record<string, typeof achievements>)

    return NextResponse.json({
      achievements: grouped,
      total: allAchievements.length,
      unlocked: userAchievements.length,
    })
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}


