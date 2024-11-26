import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function fetchUserCredits(userId: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single()
    
  if (error) {
    console.error('Error fetching credits:', error)
    return null
  }
  
  return data?.credits ?? 0
}