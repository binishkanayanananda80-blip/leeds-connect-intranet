import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    // Validate type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/avatars/${filename}` })
  } catch (err) {
    console.error('[Upload Error]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
