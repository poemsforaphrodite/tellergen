import { NextRequest, NextResponse } from 'next/server'
import { HfApi } from '@huggingface/inference'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const name = formData.get('name') as string

    if (!file || !category || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const api = new HfApi()
    const repoId = 'nikkmitra/clone'
    const filePath = path.join('voices', category, `${name}.wav`)

    await api.uploadFile({
      file: await file.arrayBuffer(),
      path: filePath,
      repo: repoId,
    })

    return NextResponse.json({ message: 'Voice uploaded successfully' })
  } catch (error) {
    console.error('Error uploading voice:', error)
    return NextResponse.json({ error: 'Failed to upload voice' }, { status: 500 })
  }
}