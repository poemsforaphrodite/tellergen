"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CheckoutPage() {
  const [product, setProduct] = useState<{ name: string; price: number; credits?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const productName = searchParams.get('product')
    const productPrice = searchParams.get('price')
    const productCredits = searchParams.get('credits')

    if (productName && productPrice) {
      setProduct({
        name: productName,
        price: parseInt(productPrice, 10),
        credits: productCredits ? parseInt(productCredits, 10) : undefined
      })
    }
    setLoading(false)
  }, [searchParams])

  const handleCheckout = async () => {
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/user/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product?.name,
          price: product?.price,
          fullName,
          phone,
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (product?.name.endsWith('_pro')) {
          setSuccess(`Successfully purchased ${product.name.replace('_', ' ')}!`)
        } else {
          setSuccess(`Successfully purchased ${data.user.credits} credits!`)
        }
        setTimeout(() => {
          router.push('/account')
        }, 2000)
      } else {
        setError(data.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      setError('An unexpected error occurred')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!product) {
    return <div>Invalid product</div>
  }

  const subtotal = product ? product.price : 0
  const gst = subtotal * 0.18
  const total = subtotal + gst

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-100 border-green-400 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Billing details</h2>
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input 
                id="fullName" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input 
                id="phone" 
                type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="email">Email address *</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Your order</h2>
            <div className="flex justify-between">
              <span>Product</span>
              <span>Subtotal</span>
            </div>
            <div className="flex justify-between items-center">
              <span>{product?.name}</span>
              <span>x 1</span>
              <span>₹{product?.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST@18%</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCheckout}>
            Proceed to Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}