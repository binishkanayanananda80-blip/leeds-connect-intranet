'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction } from '@/lib/audit'
import { notifyTargetedUsers } from '@/lib/createNotification'

export async function createAnnouncement(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const branchId = formData.get('branchId') as string || null
  const isPinned = formData.get('isPinned') === 'on'
  const categoryIds = formData.getAll('categoryIds') as string[]

  if (!title?.trim() || !content?.trim()) throw new Error('Title and content are required.')

  const org = await prisma.organization.findFirst()
  if (!org) throw new Error('Organization not found')

  // Filter out empty strings from categoryIds
  const validCategoryIds = categoryIds.filter(id => id && id.trim() !== '')

  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      authorId: session.user.id,
      organizationId: org.id,
      branchId: branchId || null,
      isPinned,
      targetCategories: validCategoryIds.length > 0 ? {
        connect: validCategoryIds.map(id => ({ id }))
      } : undefined
    },
  })

  // Audit trail
  await logAdminAction(
    session.user.id, 
    'CREATE', 
    'ANNOUNCEMENT', 
    announcement.id, 
    `Posted announcement: ${title.trim()} (Target: ${branchId || 'Global'})`
  )

  // Precision Notification
  await notifyTargetedUsers({
    message: `📢 New announcement: "${title.trim()}"`,
    link: '/announcements',
    branchId: branchId || null,
    categoryIds: categoryIds,
    excludeUserId: session.user.id
  })

  revalidatePath('/intranet/announcements')
  revalidatePath('/')
  redirect('/intranet/announcements')
}

export async function deleteAnnouncement(id: string) {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)

  if (!isAdmin) throw new Error('Not authorized')

  await prisma.announcement.delete({ where: { id } })
  
  await logAdminAction(session.user.id, 'DELETE', 'ANNOUNCEMENT', id, `Deleted announcement`)
  
  revalidatePath('/intranet/announcements')
  revalidatePath('/')
  return { success: true }
}

export async function togglePinAnnouncement(id: string, isPinned: boolean) {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin'].includes(roleName)

  if (!isAdmin) throw new Error('Not authorized')

  await prisma.announcement.update({
    where: { id },
    data: { isPinned }
  })

  await logAdminAction(session.user.id, 'UPDATE', 'ANNOUNCEMENT', id, `${isPinned ? 'Pinned' : 'Unpinned'} announcement`)

  revalidatePath('/intranet/announcements')
  revalidatePath('/')
  return { success: true }
}
