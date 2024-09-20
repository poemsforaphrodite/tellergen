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
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
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
          // ... (other form fields)
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
          <div>
            <Label htmlFor="product">Product</Label>
            <Input id="product" value={product.name} readOnly />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" value={`Rs${product.price}`} readOnly />
          </div>
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input 
              id="cardNumber" 
              value={cardNumber} 
              onChange={(e) => setCardNumber(e.target.value)} 
              required 
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input 
                id="expiryDate" 
                placeholder="MM/YY" 
                value={expiryDate} 
                onChange={(e) => setExpiryDate(e.target.value)} 
                required 
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv" 
                value={cvv} 
                onChange={(e) => setCvv(e.target.value)} 
                required 
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCheckout}>
            Complete Purchase
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}