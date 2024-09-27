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
  _id: string;
  username: string;
  email: string;
  credits: number;
  transactions: Array<{
    transactionId: string;
    merchantId: string;
    amount: number;
    status: string;
    _id: string;
  }>;
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
        console.log('User data:', data) // Log the entire user data
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800">Account</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : user ? (
            <div className="space-y-8">
              <div className="flex items-center space-x-6 bg-indigo-50 p-6 rounded-lg">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-indigo-200 text-indigo-800">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold text-indigo-800">{user.email}</h2>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your Current Balance</h3>
                <ul className="space-y-2">
                  <li className="text-2xl font-bold text-indigo-600 mb-4">
                    {user.credits.toLocaleString()} Common Credits
                  </li>
                  <li>
                    <span className="font-medium">0 Credits</span>
                    <span className="ml-2">- Text To Speech Pro</span>
                  </li>
                  <li>
                    <span className="font-medium">0 Credits</span>
                    <span className="ml-2">- Voice Cloning Pro</span>
                  </li>
                  <li>
                    <span className="font-medium">0 Credits</span>
                    <span className="ml-2">- Talking Image</span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {passwordChangeError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordChangeError}</AlertDescription>
                  </Alert>
                )}
                {passwordChangeSuccess && (
                  <Alert variant="default" className="mt-4 bg-green-100 text-green-800">
                    <AlertDescription>{passwordChangeSuccess}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Change Password
                </Button>
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