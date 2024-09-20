"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">About TellerGen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Welcome to TellerGen.com, your go-to Software as a Service (SaaS) provider specializing in innovative voice technologies. We are dedicated to transforming the way you interact with digital content through our cutting-edge solutions in Text-to-Speech (TTS), Talking Image, and Voice Cloning services.
            </p>
            <h3 className="text-xl font-semibold">Who We Are</h3>
            <p>
              At TellerGen, we believe that voice is the most powerful and natural means of communication. Our team comprises experts in artificial intelligence, machine learning, and voice synthesis, all driven by a passion for creating intuitive and accessible voice solutions. We are committed to breaking down communication barriers and bringing your digital experiences to life with the power of voice.
            </p>
            <h3 className="text-xl font-semibold">What We Do</h3>
            <p>
              Our suite of services is designed to meet the diverse needs of individuals, businesses, and developers:
            </p>
            <ul className="list-disc list-inside">
              <li><strong>Text-to-Speech (TTS):</strong> Convert written content into natural-sounding speech across various languages and dialects.</li>
              <li><strong>Talking Image:</strong> Bring images to life with synchronized lip movements and realistic voiceovers.</li>
              <li><strong>Voice Cloning:</strong> Create high-quality, personalized voice clones with just a few minutes of audio.</li>
            </ul>
            <h3 className="text-xl font-semibold">Our Mission</h3>
            <p>
              We aim to make digital communication more human and accessible. Our mission is to empower individuals and organizations with advanced voice solutions that are easy to integrate, scalable, and tailored to their needs. We are committed to continuous innovation and strive to be at the forefront of the voice technology landscape.
            </p>
            <h3 className="text-xl font-semibold">Why Choose TellerGen?</h3>
            <ul className="list-disc list-inside">
              <li><strong>State-of-the-Art Technology:</strong> Our advanced algorithms and AI-driven models ensure that our services deliver the highest quality and most natural-sounding results.</li>
              <li><strong>Customization:</strong> We offer a wide range of customization options to fit your unique needs.</li>
              <li><strong>User-Friendly API:</strong> Our services are accessible through simple, easy-to-use APIs.</li>
              <li><strong>Reliable Support:</strong> Our dedicated support team is here to help you every step of the way.</li>
            </ul>
            <h3 className="text-xl font-semibold">Get in Touch</h3>
            <p>
              Whether you're looking to enhance your applications with voice technology or create compelling voice content, TellerGen is here to help. Explore our services and discover how we can bring your digital interactions to life.
            </p>
            <p>
              <strong>Contact Us:</strong> support@tellergen.com, +91 9244039177
            </p>
          </div>
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