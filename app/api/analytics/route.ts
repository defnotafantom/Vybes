import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET creator analytics
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Get user's posts stats
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            savedBy: true,
            reactions: true,
            reposts: true,
          },
        },
      },
    })

    // Calculate totals
    const totalPosts = posts.length
    const totalLikes = posts.reduce((sum, p) => sum + p._count.likes, 0)
    const totalComments = posts.reduce((sum, p) => sum + p._count.comments, 0)
    const totalSaves = posts.reduce((sum, p) => sum + p._count.savedBy, 0)
    const totalReactions = posts.reduce((sum, p) => sum + p._count.reactions, 0)
    const totalReposts = posts.reduce((sum, p) => sum + p._count.reposts, 0)
    const totalViews = posts.reduce((sum, p) => sum + p.viewsCount, 0)

    // Get followers count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    })

    // Get profile visits (last 30 days)
    const profileVisits = await prisma.profileVisit.count({
      where: {
        profileId: userId,
        visitedAt: { gte: thirtyDaysAgo },
      },
    })

    // Get engagement by day (last 7 days)
    const recentLikes = await prisma.like.groupBy({
      by: ['createdAt'],
      where: {
        post: { authorId: userId },
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    })

    // Top performing posts
    const topPosts = posts
      .map(p => ({
        id: p.id,
        content: p.content.substring(0, 100),
        engagement: p._count.likes + p._count.comments + p._count.reactions,
        views: p.viewsCount,
        createdAt: p.createdAt,
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5)

    // Calculate engagement rate
    const engagementRate = user?._count.followers 
      ? ((totalLikes + totalComments) / (totalPosts * user._count.followers) * 100).toFixed(2)
      : 0

    return NextResponse.json({
      overview: {
        totalPosts,
        totalLikes,
        totalComments,
        totalSaves,
        totalReactions,
        totalReposts,
        totalViews,
        followers: user?._count.followers || 0,
        following: user?._count.following || 0,
        profileVisits,
        engagementRate,
      },
      topPosts,
      trends: {
        // Simplified - in production would calculate actual trends
        likes: '+12%',
        followers: '+5%',
        views: '+23%',
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Errore' }, { status: 500 })
  }
}




