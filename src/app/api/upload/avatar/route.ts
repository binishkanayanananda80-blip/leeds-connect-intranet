import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { supabase } from '@/lib/supabase'
import { extname } from 'path'

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

    // Validate size (max 5MB to match other route)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 5MB' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const ext = extname(file.name) || '.jpg'
    const filename = `${session.user.id}-${Date.now()}${ext}`
    const bytes = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filename, bytes, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[Supabase Storage Error]', uploadError)
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (err) {
    console.error('[Upload Error]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

