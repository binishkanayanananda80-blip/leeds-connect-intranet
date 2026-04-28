import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DirectoryClient } from '@/components/directory/DirectoryClient'

export default async function DirectoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { role: true }
  })

  const ADMIN_ROLES = ['Super Admin', 'Corporate Admin', 'Module Admin']
  const isAdmin = ADMIN_ROLES.includes(me?.role?.name || '')

  const VIP_CATEGORIES = [
    "Founder", "Chairperson", "Director", "Directress",
    "Network Leedership and Coordination", "Network Head", "Internal Audit"
  ]
  const isVip = isAdmin || VIP_CATEGORIES.includes(me?.employeeCategory || '')

  const isSuperAdmin = me?.role?.name === 'Super Admin'

  const whereClause: any = {
    isInIntranet: true,
    role: isSuperAdmin ? {} : { name: { not: 'Super Admin' } }
  }
  if (!isVip && me?.branchId) {
    whereClause.branchId = me.branchId
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: [{ firstName: 'asc' }],
      include: { 
        role: true, 
        branch: true, 
        department: { select: { id: true, name: true } }, 
        employeeSubCategory: true 
      },
    }),
    prisma.user.count({ where: whereClause })
  ])

  return <DirectoryClient users={users} totalCount={totalCount} />
}
