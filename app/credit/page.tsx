"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

type CreditBalance = {
  common: number;
  'Text to Speech Pro': number;
  'Voice Cloning Pro': number;
  'Talking Image': number;
};

export default function CreditPage() {
  const [creditBalance, setCreditBalance] = useState<CreditBalance>({
    common: 0,
    'Text to Speech Pro': 0,
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
          'Text to Speech Pro': data.credits['Text to Speech Pro'],
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

  const purchaseOptions = [
    { credits: 1000, price: 10 },
    { credits: 4000, price: 30 },
    { credits: 7000, price: 50 },
    { credits: 12000, price: 100 },
    { product: 'tellergen_combo_pack', price: 999 } // Added Combo Pack
  ]

  const handlePurchase = (credits: number, price: number, product?: string) => {
    if (product) {
      router.push(`/checkout?product=${product}&price=${price}`);
    } else {
      router.push(`/checkout?product=${credits}_credits&price=${price}`);
    }
  }

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
                {Object.entries(creditBalance).map(([service, credits]) => (
                  service !== 'common' && (
                    <p key={service} className="text-lg">
                      <span className="font-medium">{credits.toLocaleString()} Credits</span> - {service}
                    </p>
                  )
                ))}
              </div>

              <div className="bg-indigo-50 rounded-lg p-6 shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-800 mb-4">Credit Value</h3>
                {creditValue.map(({ service, value }) => (
                  <p key={service} className="text-lg">
                    <span className="font-medium">{service}</span> - {value}
                  </p>
                ))}
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Purchase Credits:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {purchaseOptions.map(({ credits, price, product }) => (
                    <Button 
                      key={credits || product} 
                      onClick={() => handlePurchase(credits ?? 0, price, product)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-6"
                    >
                      {product ? `Buy Combo Pack - Rs ${price}` : `Buy ${credits?.toLocaleString() ?? 0} Credits - Rs ${price}`}
                    </Button>
                  ))}
                </div>
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