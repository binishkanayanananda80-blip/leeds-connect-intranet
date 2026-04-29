import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'
import { extname } from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Super Admin' || roleName === 'Corporate Admin'

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const targetUserId = (formData.get('userId') as string) || session.user.id

    // Non-admins can only upload for themselves
    if (!isAdmin && targetUserId !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP or GIF.' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const ext = extname(file.name) || '.jpg'
    const filename = `${targetUserId}-${Date.now()}${ext}`
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

    // Update user record in Prisma
    await prisma.user.update({
      where: { id: targetUserId },
      data: { image: publicUrl }
    })

    return NextResponse.json({ imageUrl: publicUrl })
  } catch (err) {
    console.error('[AvatarUpload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

