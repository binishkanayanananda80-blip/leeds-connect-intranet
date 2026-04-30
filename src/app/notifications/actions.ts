'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await prisma.notification.update({
    where: { 
      id: notificationId,
      userId: session.user.id
    },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  })

  revalidatePath('/notifications')
  return { success: true }
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await prisma.notification.updateMany({
    where: { 
      userId: session.user.id,
      isRead: false
    },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  })

  revalidatePath('/notifications')
  return { success: true }
}

export async function cleanupNotifications() {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  // Requirement: Auto-delete all notifications 1 hour after being read
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  await prisma.notification.deleteMany({
    where: {
      userId: session.user.id,
      isRead: true,
      readAt: { lte: oneHourAgo }
    }
  })

  // Requirement: Auto-delete OTP notifications 5 minutes after being read
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  
  await prisma.notification.deleteMany({
    where: {
      userId: session.user.id,
      isRead: true,
      readAt: { lte: fiveMinutesAgo },
      message: { contains: 'OTP', mode: 'insensitive' }
    }
  })

}
