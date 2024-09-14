import { cookies } from 'next/headers'

export function getUserIdFromRequest(request: Request): string | null {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value || null
}