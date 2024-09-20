"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface User {
  username: string;
  email: string;
  credits?: number;
  subscriptions?: {
    tts_pro: boolean;
    talking_image_pro: boolean;
    clone_voice_pro: boolean;
  };
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/current')
      const data = await response.json()
      if (response.ok) {
        setUser(data.user)
      } else {
        setError(data.message || 'Failed to fetch user data')
      }
    } catch (err) {
      setError('An error occurred while fetching user data')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordChangeError(null)
    setPasswordChangeSuccess(null)

    if (newPassword !== confirmPassword) {
      setPasswordChangeError("New passwords don't match")
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordChangeSuccess('Password changed successfully')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordChangeError(data.message || 'Failed to change password')
      }
    } catch (err) {
      setPasswordChangeError('An error occurred while changing password')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Account</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error}</p>
          ) : user ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.username}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Credits</Label>
                  <p className="text-xl font-semibold">
                    {user.credits !== undefined ? user.credits.toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label>Subscriptions</Label>
                  <ul className="list-disc list-inside">
                    <li>TTS Pro: {user.subscriptions?.tts_pro ? 'Active' : 'Inactive'}</li>
                    <li>Talking Image Pro: {user.subscriptions?.talking_image_pro ? 'Active' : 'Inactive'}</li>
                    <li>Clone Voice Pro: {user.subscriptions?.clone_voice_pro ? 'Active' : 'Inactive'}</li>
                  </ul>
                </div>
              </div>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {passwordChangeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordChangeError}</AlertDescription>
                  </Alert>
                )}
                {passwordChangeSuccess && (
                  <Alert variant="default" className="bg-green-100 text-green-800">
                    <AlertDescription>{passwordChangeSuccess}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit">Change Password</Button>
              </form>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 flex justify-center space-x-8">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="text-sm">
              <HomeIcon className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <Link href="/credit">
            <Button variant="ghost" size="sm" className="text-sm">
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Credit
            </Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost" size="sm" className="text-sm">
              <UserIcon className="h-4 w-4 mr-2" />
              Account
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}