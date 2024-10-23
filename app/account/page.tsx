"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useRouter } from 'next/navigation'

interface User {
  _id: string;
  username: string;
  email: string;
  subscriptions: Array<{
    name: string;
    status: string;
    expiryDate: string;
  }>;
  transactions: Array<{
    transactionId: string;
    merchantId: string;
    amount: number;
    status: string;
    _id: string;
  }>;
}

// Update the CreditBalance type to match the credit page
type CreditBalance = {
  common: number;
  'Text to Speech Pro': {
    isSubscribed: boolean;
    subscriptionEndDate: Date | null;
  };
  'Voice Cloning Pro': number;
  'Talking Image': number;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    common: 0,
    'Text to Speech Pro': {
      isSubscribed: false,
      subscriptionEndDate: null
    },
    'Voice Cloning Pro': 0,
    'Talking Image': 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordChangeError, setPasswordChangeError] = useState<string | null>(null)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<string | null>(null)
  const router = useRouter()

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      if (!data.isLoggedIn) {
        router.push('/login'); // Redirect to login if not logged in
      } else {
        fetchUserData()
        fetchCredits()
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }, [router]) // Add router to the dependency array

  useEffect(() => {
    checkLoginStatus()
  }, [checkLoginStatus])

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

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits')
      const data = await response.json()
      if (response.ok) {
        setCreditBalance({
          common: data.credits.common,
          'Text to Speech Pro': {
            isSubscribed: data.credits['Text to Speech Pro'].isSubscribed,
            subscriptionEndDate: data.credits['Text to Speech Pro'].subscriptionEndDate
          },
          'Voice Cloning Pro': data.credits['Voice Cloning Pro'],
          'Talking Image': data.credits['Talking Image']
        })
      } else {
        console.error('Failed to fetch credits:', data.error)
      }
    } catch (err) {
      console.error('An error occurred while fetching credits:', err)
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
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg p-4 md:p-6 lg:p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800">Account</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : user ? (
            <div className="space-y-8 md:space-y-10">
              <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-6 bg-indigo-50 p-4 md:p-6 rounded-lg">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarFallback className="text-3xl bg-indigo-200 text-indigo-800">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-3xl font-bold text-indigo-800">{user.email}</h2>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 md:p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your Current Balance</h3>
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-indigo-600">
                    {creditBalance.common.toLocaleString()} Common Credits
                  </p>

                  <div className="text-lg">
                    {creditBalance['Text to Speech Pro'].isSubscribed ? (
                      <p>
                        <span className="font-medium">Text to Speech Pro</span> - 
                        <span className="ml-2 text-green-600">
                          Unlimited Access (Valid until {new Date(creditBalance['Text to Speech Pro'].subscriptionEndDate!).toLocaleDateString()})
                        </span>
                      </p>
                    ) : (
                      <p>
                        <span className="font-medium">Text to Speech Pro</span> - No active subscription
                      </p>
                    )}
                  </div>

                  <p className="text-lg">
                    <span className="font-medium">{creditBalance['Voice Cloning Pro'].toLocaleString()} Credits</span> - Voice Cloning Pro
                  </p>

                  <p className="text-lg">
                    <span className="font-medium">{creditBalance['Talking Image'].toLocaleString()} Credits</span> - Talking Image
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="bg-white p-4 md:p-6 rounded-lg shadow-md">
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
                <Button type="submit" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto">
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
