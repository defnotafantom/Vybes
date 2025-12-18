import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasPermission, PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const ALLOWED_MODELS = [
  'user',
  'post',
  'comment',
  'event',
  'notification',
  'quest',
  'transaction',
] as const

type AllowedModel = typeof ALLOWED_MODELS[number]

// GET database records (SUPERADMIN only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || !hasPermission(adminRole, PERMISSIONS.DB_READ)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model') as AllowedModel
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!model || !ALLOWED_MODELS.includes(model)) {
      return NextResponse.json(
        { error: 'Modello non valido', allowedModels: ALLOWED_MODELS },
        { status: 400 }
      )
    }

    // Dynamic query based on model
    const modelClient = (prisma as any)[model]
    
    const [records, total] = await Promise.all([
      modelClient.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      modelClient.count(),
    ])

    return NextResponse.json({
      model,
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin DB read error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

// POST execute raw query (SUPERADMIN only - very restricted)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (adminRole !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Solo SUPERADMIN può eseguire query' }, { status: 403 })
    }

    const body = await request.json()
    const { action, model, data, where } = body

    if (!ALLOWED_MODELS.includes(model)) {
      return NextResponse.json({ error: 'Modello non valido' }, { status: 400 })
    }

    const modelClient = (prisma as any)[model]
    let result

    switch (action) {
      case 'findMany':
        result = await modelClient.findMany({
          where,
          take: 100,
          orderBy: { createdAt: 'desc' },
        })
        break
      case 'findUnique':
        result = await modelClient.findUnique({ where })
        break
      case 'update':
        if (!hasPermission(adminRole, PERMISSIONS.DB_WRITE)) {
          return NextResponse.json({ error: 'Permesso negato' }, { status: 403 })
        }
        result = await modelClient.update({ where, data })
        break
      case 'delete':
        if (!hasPermission(adminRole, PERMISSIONS.DB_DELETE)) {
          return NextResponse.json({ error: 'Permesso negato' }, { status: 403 })
        }
        result = await modelClient.delete({ where })
        break
      case 'count':
        result = await modelClient.count({ where })
        break
      default:
        return NextResponse.json({ error: 'Azione non valida' }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Admin DB query error:', error)
    return NextResponse.json({ error: 'Errore query' }, { status: 500 })
  }
}


