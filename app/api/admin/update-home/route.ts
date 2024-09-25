import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'app', 'home', 'page.tsx')
    await fs.writeFile(filePath, content, 'utf-8')

    return NextResponse.json({ message: 'Home page updated successfully' })
  } catch (error) {
    console.error('Error updating home page:', error)
    return NextResponse.json({ error: 'Failed to update home page' }, { status: 500 })
  }
}