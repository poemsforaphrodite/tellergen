"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, Key, User, BarChart, BookOpen, FileText, LogOut, DollarSign, Mic, VideoIcon, MessageSquare, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const navigation = {
  create: [
    { name: 'Text to Speech', icon: FileText },
    { name: 'Voice Cloning', icon: Mic },
    { name: 'Video Generation', icon: VideoIcon },
  ],
  conversational: [
    { name: 'Chat Assistant', icon: MessageSquare },
    { name: 'Voice Assistant', icon: Mic },
  ],
  workflows: [
    { name: 'Custom Workflows', icon: Settings2, beta: true },
  ],
  tools: [
    { name: 'API Documentation', icon: BookOpen },
    { name: 'Usage Analytics', icon: BarChart },
  ]
}

const supabase = createClientComponentClient()

export function Sidebar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        if (currentUser) {
          setUser(currentUser)
          
          // Fetch user credits
          const { data: userData, error: creditsError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', currentUser.id)
            .single()
            
          if (creditsError) throw creditsError
          setCredits(userData.credits)
        }
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        const { data: userData, error: creditsError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', session.user.id)
          .single()
          
        if (!creditsError && userData) {
          setCredits(userData.credits)
        }
      } else {
        setUser(null)
        setCredits(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    console.log('Sign out clicked')
    try {
      // First try server-side sign out
      console.log('Attempting server-side sign out...')
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Server-side sign out failed')
      }

      // Then clear client-side auth
      console.log('Attempting to sign out from Supabase...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
        throw error
      }
      console.log('Supabase sign out successful')

      // Force a router refresh to update server-side state
      console.log('Refreshing router...')
      router.refresh()
      
      // Redirect to login page
      console.log('Redirecting to login page...')
      window.location.href = '/login'
    } catch (err) {
      console.error('Sign out error:', err)
      alert('Failed to sign out. Please try again.')
    }
  }

  return (
    <div className="flex flex-col h-screen w-64 border-r bg-background">
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">audiovy</h1>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground">CREATE</h2>
          <div className="space-y-1">
            {navigation.create.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start ${
                  item.name === "Text to Speech" ? "bg-accent" : ""
                }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground">CONVERSATIONAL</h2>
          <div className="space-y-1">
            {navigation.conversational.map((item) => (
              <Button key={item.name} variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground">WORKFLOWS</h2>
          <div className="space-y-1">
            {navigation.workflows.map((item) => (
              <Button key={item.name} variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
                {item.beta && (
                  <span className="ml-auto text-xs bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">Beta</span>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold tracking-wider text-muted-foreground">TOOLS</h2>
          <div className="space-y-1">
            {navigation.tools.map((item) => (
              <Button key={item.name} variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto">
        <div className="p-4 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>
                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="text-sm font-medium truncate w-full">
                    {user?.email?.split('@')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Credits</DropdownMenuLabel>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <span>Total: {credits ?? 0}</span>
                  <span>Remaining: {credits ?? 0}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button variant="ghost" className="w-full justify-start">
                  Upgrade
                </Button>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/profile" className="w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/api-keys" className="w-full">API Keys</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/subscription" className="w-full">Subscription</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/payouts" className="w-full">Payouts</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <Link href="/affiliate" className="w-full">Become an affiliate</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/analytics" className="w-full">Usage analytics</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuLabel>Help & Legal</DropdownMenuLabel>
              <DropdownMenuItem>
                <Link href="/docs" className="w-full">Docs and resources</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/terms" className="w-full">Terms and privacy</Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleSignOut}>
                <div className="flex items-center w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
