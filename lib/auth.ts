import { cookies } from 'next/headers'

export function getUserIdFromRequest(): string | null {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value || null
}