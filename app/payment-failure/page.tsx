"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const reason = searchParams?.get('reason') ?? null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-700 mb-4">We're sorry, but your payment could not be processed.</p>
        {reason && <p className="text-gray-700 mb-4">Reason: {reason}</p>}
        <Link href="/home" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  )
}