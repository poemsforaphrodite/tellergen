"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus("Sending...")

    // Here you would typically send the form data to your backend
    // For this example, we'll just simulate a successful submission
    setTimeout(() => {
      setSubmitStatus("Message sent successfully!")
      setName("")
      setEmail("")
      setMessage("")
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <p>We'd love to hear from you! Whether you have a question about our services, need technical support, or want to provide feedback, the TellerGen team is here to help.</p>
            
            <h3 className="text-xl font-semibold">How to Reach Us</h3>
            
            <div>
              <h4 className="font-semibold">General Inquiries</h4>
              <p>Email: support@tellergen.com</p>
              <p>Phone: +91 9244039177</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Technical Support</h4>
              <p>Email: support@tellergen.com</p>
              <p>Phone: +91 9244039177</p>
              <p>Support Hours: Monday - Friday, 9:00 AM - 5:00 PM [Insert Time Zone]</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Billing and Account Support</h4>
              <p>Email: support@tellergen.com</p>
              <p>Phone: +91 9244039177</p>
            </div>
            
            <div>
              <h4 className="font-semibold">Business Address</h4>
              <p>Ward no. 11, Baaikunthpur, Chhattisgaarh 497335</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Send Message</Button>
          </form>
          {submitStatus && <p className="mt-4 text-green-600">{submitStatus}</p>}
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