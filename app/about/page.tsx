"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { HomeIcon, CreditCardIcon, UserIcon } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 p-4 pb-16">
      <Card className="max-w-4xl mx-auto backdrop-blur-md bg-white/90 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-indigo-800 text-center">About TellerGen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700">
            Welcome to TellerGen.com, your go-to Software as a Service (SaaS) provider specializing in innovative voice technologies. We are dedicated to transforming the way you interact with digital content through our cutting-edge solutions in Text-to-Speech (TTS), Talking Image, and Voice Cloning services.
          </p>
          
          <h3 className="text-2xl font-semibold text-indigo-800">Who We Are</h3>
          <p className="text-gray-700">
            At TellerGen, we believe that voice is the most powerful and natural means of communication. Our team comprises experts in artificial intelligence, machine learning, and voice synthesis, all driven by a passion for creating intuitive and accessible voice solutions. We are committed to breaking down communication barriers and bringing your digital experiences to life with the power of voice.
          </p>
          
          <h3 className="text-2xl font-semibold text-indigo-800">What We Do</h3>
          <p className="text-gray-700">
            Our suite of services is designed to meet the diverse needs of individuals, businesses, and developers:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            <li><strong>Text-to-Speech (TTS):</strong> Convert written content into natural-sounding speech across various languages and dialects. Whether it's for educational content, accessibility purposes, or automated customer service, our TTS technology ensures clear, engaging, and lifelike audio.</li>
            <li><strong>Talking Image:</strong> Bring images to life with synchronized lip movements and realistic voiceovers. Perfect for marketing, entertainment, and educational applications, our Talking Image technology creates interactive and engaging visual experiences.</li>
            <li><strong>Voice Cloning:</strong> Create high-quality, personalized voice clones with just a few minutes of audio. Ideal for content creators, voice artists, and businesses, our Voice Cloning service offers a seamless way to produce consistent and unique voice content.</li>
          </ul>
          
          <h3 className="text-2xl font-semibold text-indigo-800">Our Mission</h3>
          <p className="text-gray-700">
            We aim to make digital communication more human and accessible. Our mission is to empower individuals and organizations with advanced voice solutions that are easy to integrate, scalable, and tailored to their needs. We are committed to continuous innovation and strive to be at the forefront of the voice technology landscape.
          </p>
          
          <h3 className="text-2xl font-semibold text-indigo-800">Why Choose TellerGen?</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-4">
            <li><strong>State-of-the-Art Technology:</strong> Our advanced algorithms and AI-driven models ensure that our services deliver the highest quality and most natural-sounding results.</li>
            <li><strong>Customization:</strong> We offer a wide range of customization options to fit your unique needs, whether it's creating custom voice personas or integrating our technology into your existing platforms.</li>
            <li><strong>User-Friendly API:</strong> Our services are accessible through simple, easy-to-use APIs, making it seamless to integrate our voice solutions into your applications and workflows.</li>
            <li><strong>Reliable Support:</strong> Our dedicated support team is here to help you every step of the way, from integration to optimization, ensuring you get the most out of our services.</li>
          </ul>
          
          {/* ... (rest of the content) ... */}
          
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