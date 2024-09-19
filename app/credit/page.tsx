"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export default function CreditPage() {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handlePurchase = async (credits: number) => {
    try {
      const response = await fetch('/api/user/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credits }),
      })
      const data = await response.json()
      if (response.ok) {
        setCredits(data.newCredits)
        alert(`Successfully purchased ${credits.toLocaleString()} credits!`)
      } else {
        setError(data.message || 'Failed to purchase credits')
      }
    } catch (err) {
      setError('An error occurred while purchasing credits')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Credit</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              <p className="mb-4">Your current credit balance: {credits.toLocaleString()}</p>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Purchase Credits:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {creditOptions.map(({ credits, price }) => (
                    <Button key={credits} onClick={() => handlePurchase(credits)}>
                      Buy {credits.toLocaleString()} Credits (Rs{price})
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
          <Link href="/home">
            <Button variant="ghost">Clone</Button>
          </Link>
          <Link href="/credit">
            <Button variant="ghost">Credit</Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost">Account</Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}