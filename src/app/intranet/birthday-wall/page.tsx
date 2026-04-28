import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { format, isThisMonth, differenceInDays } from 'date-fns'
import { Cake } from 'lucide-react'
import { BirthdayWallClient } from '@/components/birthday-wall/BirthdayWallClient'

function getNextBirthday(dob: Date): Date | null {
  try {
    const today = new Date()
    if (isNaN(dob.getTime())) return null
    const upcoming = new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
    if (upcoming < today) upcoming.setFullYear(today.getFullYear() + 1)
    return upcoming
  } catch {
    return null
  }
}

const CONFETTI_EMOJIS = ['🎂', '🎉', '🎈', '🥳', '🎊', '✨', '🌟', '🎁']

export default async function BirthdayWallPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { role: true }
  })
  const roleName = me?.role?.name || ''
  
  // Define visibility rules: Admins & Moderators see everything
  const isPrivileged = [
    'Super Admin', 
    'Corporate Admin', 
    'Module Admin', 
    'Moderator', 
    'Admin'
  ].includes(roleName)

  const allUsers = await prisma.user.findMany({
    where: {
      dateOfBirth: { not: null },
      isInIntranet: true,
      role: roleName === 'Super Admin' ? {} : { name: { not: 'Super Admin' } },
      // Apply branch restriction for non-privileged staff
      ...( (!isPrivileged && me?.branchId) ? { branchId: me.branchId } : {} )
    },
    select: {
      id: true,
      name: true,
      image: true,
      dateOfBirth: true,
      branch: { select: { name: true } },
      role: { select: { name: true } },
      designation: true
    }
  })

  // Basic normalization for date processing
  const usersWithBirthdays = allUsers.map(u => ({
    ...u,
    dateOfBirth: u.dateOfBirth?.toISOString() || null
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FC] pt-8">
      <BirthdayWallClient users={usersWithBirthdays} />
    </div>
  )
}
