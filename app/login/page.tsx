import { redirect } from 'next/navigation'

export default function LoginRedirect({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams || {})) {
    if (Array.isArray(v)) v.forEach((vv) => vv != null && params.append(k, vv))
    else if (v != null) params.set(k, v)
  }
  const qs = params.toString()
  redirect(qs ? `/auth?${qs}` : '/auth')
}
