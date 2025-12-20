"use client"

import { cn } from '@/lib/utils'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER' | string

export function RoleBadge({ role, className }: { role?: UserRole | null; className?: string }) {
  const r = (role || 'DEFAULT').toString().toUpperCase()

  const meta = (() => {
    switch (r) {
      case 'ARTIST':
        return { label: 'Artista', cls: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25' }
      case 'RECRUITER':
        return { label: 'Recruiter', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' }
      case 'ARTIST_RECRUITER':
        return { label: 'Artista & Recruiter', cls: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/25' }
      default:
        return { label: 'Utente', cls: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20' }
    }
  })()

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-sm',
        meta.cls,
        className
      )}
      title={meta.label}
    >
      {meta.label}
    </span>
  )
}










