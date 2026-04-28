'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAdminAction } from '@/lib/audit'

export async function createCelebration(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const staffName = formData.get('staffName') as string
  const staffRole = formData.get('staffRole') as string
  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const dateStr = formData.get('date') as string

  if (!staffName || !type || !title) {
    throw new Error('Staff Name, Type, and Title are required.')
  }

  const org = await prisma.organization.findFirst()
  if (!org) throw new Error('Organization not found')

  let finalUserId = formData.get('userId') as string | null
  if (!finalUserId) finalUserId = null

  // If no explicit user ID was provided (e.g. they typed the name but didn't click the dropdown),
  // try to find an exact match by name to link the avatar automatically.
  if (!finalUserId && staffName) {
    const matchedUser = await prisma.user.findFirst({
      where: { name: staffName.trim(), isInIntranet: true }
    })
    if (matchedUser) {
      finalUserId = matchedUser.id
      // Auto-fill role if they didn't provide one
      if (!staffRole && matchedUser.roleId) {
        // We could fetch the role name, but we only have staffRole as a string.
        // It's okay, we just want the avatar link mainly.
      }
    }
  }

  const celebration = await prisma.celebration.create({
    data: {
      staffName: staffName.trim(),
      staffRole: staffRole?.trim() || null,
      userId: finalUserId,
      type,
      title: title.trim(),
      message: description?.trim() || null,
      publishDate: dateStr ? new Date(dateStr) : new Date(),
      organizationId: org.id,
      status: 'APPROVED'
    }
  })

  await logAdminAction(
    session.user.id,
    'CREATE',
    'CELEBRATION',
    celebration.id,
    `Added celebration for ${staffName}: ${title}`
  )

  revalidatePath('/intranet/celebrations')
  revalidatePath('/')
  return { success: true }
}

export async function deleteCelebration(id: string) {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Module Admin'].includes(roleName)

  if (!isAdmin) throw new Error('Not authorized')

  await prisma.celebration.delete({ where: { id } })
  
  await logAdminAction(session.user.id, 'DELETE', 'CELEBRATION', id, `Deleted celebration`)
  
  revalidatePath('/intranet/celebrations')
  revalidatePath('/')
  return { success: true }
}
