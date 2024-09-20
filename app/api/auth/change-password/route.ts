import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { getUserIdFromRequest } from '@/lib/auth'

export async function POST(request: Request) {
  await dbConnect()

  const userId = getUserIdFromRequest()

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { currentPassword, newPassword } = await request.json()

  try {
    const user = await User.findById(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)

    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await user.save()

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ success: false, message: 'An error occurred while changing the password' }, { status: 500 })
  }
}