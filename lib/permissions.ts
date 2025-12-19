// Permission definitions for admin roles
export const PERMISSIONS = {
  // Content moderation
  CONTENT_VIEW: 'content_view',
  CONTENT_MODERATE: 'content_moderate',
  CONTENT_DELETE: 'content_delete',
  
  // User management
  USERS_VIEW: 'users_view',
  USERS_EDIT: 'users_edit',
  USERS_BAN: 'users_ban',
  USERS_DELETE: 'users_delete',
  
  // Role management
  ROLES_VIEW: 'roles_view',
  ROLES_EDIT: 'roles_edit',
  ROLES_ASSIGN: 'roles_assign',
  
  // Database access
  DB_READ: 'db_read',
  DB_WRITE: 'db_write',
  DB_DELETE: 'db_delete',
  
  // System
  SYSTEM_SETTINGS: 'system_settings',
  SYSTEM_LOGS: 'system_logs',
  SYSTEM_ANALYTICS: 'system_analytics',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Default permissions by role
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  USER: [],
  MODERATOR: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.USERS_VIEW,
  ],
  ADMIN: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_MODERATE,
    PERMISSIONS.CONTENT_DELETE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_BAN,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.SYSTEM_ANALYTICS,
  ],
  SUPERADMIN: Object.values(PERMISSIONS), // All permissions
}

export function hasPermission(adminRole: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[adminRole] || []
  return permissions.includes(permission)
}

export function getPermissionsForRole(adminRole: string): Permission[] {
  return ROLE_PERMISSIONS[adminRole] || []
}





