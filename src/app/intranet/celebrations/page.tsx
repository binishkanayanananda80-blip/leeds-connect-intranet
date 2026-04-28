import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import CelebrationsClient from '@/components/celebrations/CelebrationsClient'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Celebrations & Milestones | Leeds Connect',
  description: 'Celebrating the achievements and milestones of our staff family.',
}

export default async function CelebrationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')



  const [celebrations, allEmployees] = await Promise.all([
    prisma.celebration.findMany({
      orderBy: { publishDate: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            role: { select: { name: true } }
          }
        }
      }
    }),
    prisma.user.findMany({
      where: { isInIntranet: true },
      select: { 
        id: true, 
        name: true, 
        role: { select: { name: true } } 
      },
      orderBy: { name: 'asc' }
    })
  ])

  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Module Admin'].includes(roleName)

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-10">
      <CelebrationsClient 
        initialCelebrations={celebrations.map(c => ({
          ...c,
          // Use manual staff info if present, otherwise fall back to linked user
          staffName: c.staffName || c.user?.name || 'Team Member',
          staffRole: c.staffRole || (c.user as any)?.role?.name || 'Member'
        }))} 
        isAdmin={isAdmin} 
        employees={allEmployees.map(e => ({
          id: e.id,
          name: e.name,
          role: e.role?.name || 'Staff'
        }))}
      />
    </div>
  )
}
