'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'

// Helper to save files locally
async function saveFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
  const savePath = join(process.cwd(), 'public', 'uploads', folder, filename)
  await writeFile(savePath, buffer)
  return `/uploads/${folder}/${filename}`
}

export async function getPendingArticles() {
  return prisma.article.findMany({
    where: { status: 'PENDING', documentType: 'Blog Article' },
    include: { author: true }
  })
}

export async function getPublishedContent() {
  const articles = await prisma.article.findMany({
    where: { status: 'APPROVED' },
    include: { author: true },
    orderBy: { createdAt: 'desc' }
  })
  const contentItems = await prisma.contentItem.findMany({
    where: { status: 'PUBLISHED' },
    include: { createdBy: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return {
    articles: articles.map(a => ({ id: a.id, title: a.title, type: 'ARTICLE', date: a.createdAt, author: a.author.name })),
    contentItems: contentItems.map(c => ({ id: c.id, title: c.title, type: 'CONTENT_ITEM', date: c.createdAt, author: c.createdBy.name }))
  }
}

export async function deleteContent(id: string, type: 'ARTICLE' | 'CONTENT_ITEM') {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  if (!['Super Admin', 'Corporate Admin'].includes(roleName)) throw new Error('Unauthorized')

  if (type === 'ARTICLE') {
    await prisma.comment.deleteMany({ where: { entityId: id, entityType: 'ARTICLE' } })
    await prisma.reaction.deleteMany({ where: { entityId: id, entityType: 'ARTICLE' } })
    await prisma.article.delete({ where: { id } })
  } else {
    await prisma.contentItem.delete({ where: { id } })
  }
}

export async function approveArticle(id: string) {
  const session = await auth()
  return prisma.article.update({
    where: { id },
    data: { 
      status: 'APPROVED', 
      reviewedById: session?.user?.id 
    }
  })
}

export async function rejectArticle(id: string, notes: string) {
  const session = await auth()
  return prisma.article.update({
    where: { id },
    data: { 
      status: 'REJECTED', 
      reviewNotes: notes, 
      reviewedById: session?.user?.id 
    }
  })
}

export async function publishContent(formData: FormData) {
  console.log('[Knowledge Hub] Attempting to publish content...')
  const session = await auth()
  const org = await prisma.organization.findFirst() // Assume a default org for now
  
  if (!session?.user?.id || !org) throw new Error("Unauthorized or Org missing")

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const contentType = formData.get('contentType') as string
  const audienceFlags = formData.get('audienceFlags') as string
  const mainCategory = formData.get('mainCategory') as string | null
  const subCategory = formData.get('subCategory') as string | null
  const file = formData.get('file') as File | null

  let fileUrl = null
  let fileName = null
  let fileSize = null

  if (file && file.size > 0 && file.name !== 'undefined') {
    fileUrl = await saveFile(file, 'knowledge')
    fileName = file.name
    fileSize = file.size
  }

  try {
    return await prisma.contentItem.create({
      data: {
        title,
        content,
        contentType,
        mainCategory: mainCategory || null,
        subCategory: subCategory || null,
        audienceFlags: audienceFlags || '',
        fileUrl,
        fileName,
        fileSize,
        createdById: session.user.id,
        organizationId: org.id
      }
    })
  } catch (err: any) {
    console.error('[publishContent ERROR]', err?.message, err?.code)
    throw new Error(`Database error: ${err?.message || 'Unknown error'}`)
  }
}
