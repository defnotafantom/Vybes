import { Suspense } from 'react'
import ResetPasswordClient from './reset-password-client'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-600 dark:text-slate-400">Caricamento…</div>}>
      <ResetPasswordClient />
    </Suspense>
  )
}

