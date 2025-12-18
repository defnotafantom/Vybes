import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// GET all users (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || !hasPermission(adminRole, PERMISSIONS.USERS_VIEW)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { username: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          image: true,
          role: true,
          adminRole: true,
          emailVerified: true,
          level: true,
          experience: true,
          coins: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// PATCH update user (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || !hasPermission(adminRole, PERMISSIONS.USERS_EDIT)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, data } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 })
    }

    // Prevent changing SUPERADMIN roles unless you're SUPERADMIN
    if (data.adminRole) {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { adminRole: true },
      })

      if (targetUser?.adminRole === 'SUPERADMIN' && adminRole !== 'SUPERADMIN') {
        return NextResponse.json(
          { error: 'Non puoi modificare un SUPERADMIN' },
          { status: 403 }
        )
      }

      if (data.adminRole === 'SUPERADMIN' && adminRole !== 'SUPERADMIN') {
        return NextResponse.json(
          { error: 'Solo un SUPERADMIN può assegnare il ruolo SUPERADMIN' },
          { status: 403 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.adminRole && { adminRole: data.adminRole }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.coins !== undefined && { coins: data.coins }),
        ...(data.level !== undefined && { level: data.level }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminRole: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// DELETE user (admin only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || !hasPermission(adminRole, PERMISSIONS.USERS_DELETE)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId richiesto' }, { status: 400 })
    }

    // Prevent deleting SUPERADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { adminRole: true },
    })

    if (targetUser?.adminRole === 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Non puoi eliminare un SUPERADMIN' },
        { status: 403 }
      )
    }

    await prisma.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

