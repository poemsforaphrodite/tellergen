"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

  const handlePurchase = async (amount: number) => {
    try {
      const response = await fetch('/api/user/purchase-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (response.ok) {
        setCredits(data.newCredits)
        alert(`Successfully purchased ${amount} credits!`)
      } else {
        setError(data.message || 'Failed to purchase credits')
      }
    } catch (err) {
      setError('An error occurred while purchasing credits')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4">
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
              <p className="mb-4">Your current credit balance: {credits}</p>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Purchase Credits:</h3>
                <div className="flex space-x-4">
                  <Button onClick={() => handlePurchase(100)}>Buy 100 Credits ($10)</Button>
                  <Button onClick={() => handlePurchase(500)}>Buy 500 Credits ($45)</Button>
                  <Button onClick={() => handlePurchase(1000)}>Buy 1000 Credits ($80)</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}