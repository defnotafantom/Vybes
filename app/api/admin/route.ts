import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// GET admin stats and overview
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || adminRole === 'USER') {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Basic stats for all admin roles
    const [userCount, postCount, eventCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.event.count(),
      prisma.comment.count(),
    ])

    // Recent activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        adminRole: true,
        createdAt: true,
      },
    })

    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      stats: {
        users: userCount,
        posts: postCount,
        events: eventCount,
        comments: commentCount,
      },
      recentUsers,
      recentPosts,
      permissions: {
        canEditUsers: hasPermission(adminRole, PERMISSIONS.USERS_EDIT),
        canDeleteUsers: hasPermission(adminRole, PERMISSIONS.USERS_DELETE),
        canReadDB: hasPermission(adminRole, PERMISSIONS.DB_READ),
        canWriteDB: hasPermission(adminRole, PERMISSIONS.DB_WRITE),
        canManageRoles: hasPermission(adminRole, PERMISSIONS.ROLES_EDIT),
      },
    })
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}





