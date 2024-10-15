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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800 text-center">Contact Us</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 mb-6">
            <p className="text-gray-700">We'd love to hear from you! Whether you have a question about our services, need technical support, or want to provide feedback, the TellerGen team is here to help.</p>
            
            <h3 className="text-2xl font-semibold text-indigo-800">How to Reach Us</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-indigo-700">General Inquiries</h4>
                <p className="text-gray-700">For general questions, partnership opportunities, or media inquiries:</p>
                <p className="text-gray-700">Email: support@tellergen.com</p>
                <p className="text-gray-700">Phone: +91 9244039177</p>
                <p className="text-gray-700">Our team will respond to your inquiry within 1-2 business days.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-indigo-700">Technical Support</h4>
                <p className="text-gray-700">If you are experiencing issues with our Text-to-Speech, Talking Image, or Voice Cloning services:</p>
                <p className="text-gray-700">Email: support@tellergen.com</p>
                <p className="text-gray-700">Phone: +91 9244039177</p>
                <p className="text-gray-700">Support Hours: Monday - Friday, 9:00 AM - 5:00 PM IST </p>
                <p className="text-gray-700">For faster assistance, please include your account or subscription ID, a detailed description of the issue, and screenshots or error messages (if applicable).</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-indigo-700">Billing and Account Support</h4>
                <p className="text-gray-700">For questions related to billing, payments, or account management:</p>
                <p className="text-gray-700">Email: support@tellergen.com</p>
                <p className="text-gray-700">Phone: +91 9244039177</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-indigo-700">Business Address</h4>
                <p className="text-gray-700">Ward no. 11, Baikunthpur, Chhattisgaarh 497335</p>
              </div>
            </div>
            
            <p className="text-gray-700">We value your feedback and are always looking for ways to improve our services. Don't hesitate to reach out – we're here to help!</p>
            <p className="text-gray-700">Thank you for choosing TellerGen. Let's talk!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
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
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Send Message</Button>
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