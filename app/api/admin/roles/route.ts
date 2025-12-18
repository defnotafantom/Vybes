import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ROLE_PERMISSIONS, PERMISSIONS, hasPermission } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

// GET all roles with their permissions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const adminRole = session.user.adminRole
    if (!adminRole || !hasPermission(adminRole, PERMISSIONS.ROLES_VIEW)) {
      return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
    }

    // Return all roles with their permissions
    const roles = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
      role,
      permissions,
      isEditable: adminRole === 'SUPERADMIN' || (role !== 'SUPERADMIN' && role !== 'ADMIN'),
    }))

    // Return all available permissions
    const allPermissions = Object.entries(PERMISSIONS).map(([key, value]) => ({
      key,
      value,
      description: getPermissionDescription(value),
    }))

    return NextResponse.json({
      roles,
      allPermissions,
      adminRoles: ['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN'],
      userRoles: ['DEFAULT', 'ARTIST', 'RECRUITER', 'ARTIST_RECRUITER'],
    })
  } catch (error) {
    console.error('Admin roles API error:', error)
    return NextResponse.json({ error: 'Errore server' }, { status: 500 })
  }
}

function getPermissionDescription(permission: string): string {
  const descriptions: Record<string, string> = {
    content_view: 'Visualizza contenuti',
    content_moderate: 'Modera contenuti (nascondi, approva)',
    content_delete: 'Elimina contenuti',
    users_view: 'Visualizza utenti',
    users_edit: 'Modifica utenti',
    users_ban: 'Banna utenti',
    users_delete: 'Elimina utenti',
    roles_view: 'Visualizza ruoli',
    roles_edit: 'Modifica ruoli',
    roles_assign: 'Assegna ruoli',
    db_read: 'Leggi database',
    db_write: 'Scrivi database',
    db_delete: 'Elimina dal database',
    system_settings: 'Impostazioni sistema',
    system_logs: 'Log di sistema',
    system_analytics: 'Analytics',
  }
  return descriptions[permission] || permission
}

