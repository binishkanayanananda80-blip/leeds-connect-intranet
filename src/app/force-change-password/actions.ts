'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

export async function updateForcePassword(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthenticated' }

  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!newPassword || newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const hashed = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: hashed,
      forcePasswordChange: false,
    },
  })

  await prisma.employee.update({
    where: { userId: session.user.id },
    data: {
      passwordHash: hashed,
      passwordChanged: true,
    },
  })

  return { success: true }
}
