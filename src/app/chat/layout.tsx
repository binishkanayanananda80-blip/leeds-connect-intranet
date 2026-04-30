import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ChatSidebar } from './ChatSidebar'
import { ChatLayoutClient } from './ChatLayoutClient'

export default async function ChatLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const myId = session.user.id
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Corporate Admin' || roleName === 'Super Admin' || roleName === 'Module Admin'
  const myBranch = (session.user as any)?.branchId

  const [categories, groupsRaw, availableUsers, me] = await Promise.all([
    prisma.chatGroupCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.chatGroup.findMany({
      where: { members: { some: { userId: myId } } },
      include: { 
        members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
        messages: { 
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' }, 
          take: 1,
          include: { sender: { select: { id: true, name: true } } }
        },
        category: true,
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.user.findMany({
      where: {
        isInIntranet: true,
        ...(isAdmin ? {} : { branchId: myBranch }),
        role: { name: { not: 'Super Admin' } }
      },
      select: { id: true, name: true, image: true, designation: true, role: { select: { name: true } } },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findUnique({ where: { id: myId }, select: { id: true, name: true, image: true, role: { select: { name: true } } } })
  ])

  const groups = await Promise.all(groupsRaw.map(async (g) => {
    const myMembership = g.members.find(m => m.userId === myId)
    const unreadCount = await prisma.message.count({
      where: {
        groupId: g.id,
        createdAt: { gt: myMembership?.lastReadAt || new Date(0) },
        senderId: { not: myId },
        isDeleted: false
      }
    })
    return { 
      ...g, 
      unreadCount, 
      isPinned: myMembership?.isPinned || false,
      isArchived: myMembership?.isArchived || false,
      isMuted: myMembership?.isMuted || false
    }
  }))

  return (
    <ChatLayoutClient
      sidebar={
        <ChatSidebar 
          groups={groups} 
          availableUsers={availableUsers} 
          currentUserId={myId} 
          currentUser={me}
          categories={categories}
        />
      }
    >
      {children}
    </ChatLayoutClient>
  )
}
