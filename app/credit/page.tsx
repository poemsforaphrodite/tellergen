"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'  // Add this import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function CreditPage() {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()  // Add this line

  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits')
      const data = await response.json()
      if (response.ok) {
        setCredits(data.credits)
      } else {
        setError(data.message || 'Failed to fetch credits')
      }
    } catch (err) {
      setError('An error occurred while fetching credits')
    } finally {
      setLoading(false)
    }
  }

  const creditOptions = [
    { credits: 50000, price: 99 },
    { credits: 200000, price: 249 },
    { credits: 500000, price: 499 },
    { credits: 1000000, price: 799 },
    { credits: 2000000, price: 1299 },
  ]

  const handlePurchase = async (credits: number, price: number) => {
    // Instead of making a purchase directly, redirect to the checkout page
    router.push(`/checkout?product=${credits}_credits&price=${price}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800">Credit</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              <div className="mb-8 p-6 bg-indigo-50 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-indigo-800 mb-2">Your Current Balance</h3>
                <p className="text-4xl font-bold text-indigo-600">{credits.toLocaleString()} Credits</p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-indigo-800">Purchase Credits:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {creditOptions.map(({ credits, price }) => (
                    <Button 
                      key={credits} 
                      onClick={() => handlePurchase(credits, price)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Buy {credits.toLocaleString()} Credits
                      <span className="block text-sm mt-1">Rs{price}</span>
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