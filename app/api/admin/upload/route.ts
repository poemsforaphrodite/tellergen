import { NextRequest, NextResponse } from 'next/server'
import { HfApi } from '@huggingface/inference'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const repoId = formData.get('repoId') as string
    const pathInRepo = formData.get('pathInRepo') as string

    if (!file || !repoId || !pathInRepo) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const api = new HfApi()
    await api.uploadFile({
      file: await file.arrayBuffer(),
      path: pathInRepo,
      repo: repoId,
    })

    return NextResponse.json({ message: 'File uploaded successfully' })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}