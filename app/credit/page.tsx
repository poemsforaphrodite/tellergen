"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

type CreditBalance = {
  common: number;
  'Text to Speech Pro': {
    isSubscribed: boolean;
    subscriptionEndDate: Date | null;
  };
  'Voice Cloning Pro': number;
  'Talking Image': number;
};

export default function CreditPage() {
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
  // Remove the unused isLoggedIn state
  const router = useRouter()

  const checkLoginStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      if (!data.isLoggedIn) {
        router.push('/login'); // Redirect to login if not logged in
      } else {
        fetchCredits()
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }, [router]) // Add router to the dependency array

  useEffect(() => {
    checkLoginStatus()
  }, [checkLoginStatus])

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
        setError(data.error || 'Failed to fetch credits')
      }
    } catch (err) {
      setError('An error occurred while fetching credits')
    } finally {
      setLoading(false)
    }
  }

  const creditValue = [
    { service: "Text to Speech Pro", value: "1 character = 1 Credit" },
    { service: "Voice Cloning Pro", value: "1 character = 1 Credit" },
    { service: "Talking Image", value: "10 seconds = 1 Credit" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800">Credit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            View Credits
          </Button>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              <div className="bg-indigo-50 rounded-lg p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Your Current Balance</h3>
                <p className="text-2xl font-bold text-indigo-600 mb-4">
                  {creditBalance.common.toLocaleString()} Common Credits
                </p>
                
                {/* Text to Speech Pro */}
                <div className="text-lg mb-2">
                  {typeof creditBalance['Text to Speech Pro'] === 'object' && creditBalance['Text to Speech Pro'].isSubscribed ? (
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

                {/* Voice Cloning Pro */}
                <p className="text-lg mb-2">
                  <span className="font-medium">{creditBalance['Voice Cloning Pro'].toLocaleString()} Credits</span> - Voice Cloning Pro
                </p>

                {/* Talking Image */}
                <p className="text-lg">
                  <span className="font-medium">{creditBalance['Talking Image'].toLocaleString()} Credits</span> - Talking Image
                </p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Credit Value</h3>
                {creditValue.map(({ service, value }) => (
                  <p key={service} className="text-lg">
                    <span className="font-medium">{service}</span> - {value}
                  </p>
                ))}
              </div>
            </>
          )}
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
