"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/current')
        const data = await response.json()
        if (response.ok && data.user) {
          setUser(data.user)
        } else {
          setError(data.error || 'Failed to fetch user')
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4">
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
            <>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <Button className="mt-4">Edit Profile</Button>
            </>
          ) : (
            <p>User not found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}