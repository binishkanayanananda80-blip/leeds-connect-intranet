'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createGroupChat(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const uiMemberIds = formData.getAll('members') as string[]
  const name = formData.get('name') as string

  if (!name || uiMemberIds.length === 0) throw new Error("Group needs a name and at least one member.")

  const memberIds = Array.from(new Set([...uiMemberIds, session.user.id]))
  const me = await prisma.user.findUnique({ where: { id: session.user.id } })
  const roleName = (session.user as any)?.roleName
  const isAdmin = roleName === 'Super Admin' || roleName === 'Corporate Admin'

  if (!isAdmin) {
    const targets = await prisma.user.findMany({ where: { id: { in: memberIds } } })
    for (const t of targets) {
      if (t.branchId !== me?.branchId) {
        throw new Error(`You can only create groups with members from your own branch.`)
      }
    }
  }

  const categoryId = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const iconUrl = formData.get('iconUrl') as string

  const group = await prisma.chatGroup.create({
    data: {
      name,
      type: 'GROUP',
      organizationId: 'leeds',
      branchId: isAdmin ? null : me?.branchId,
      description,
      iconUrl,
      categoryId: categoryId || null,
      adminId: session.user.id,
      members: {
        create: memberIds.map(id => ({ 
          userId: id,
          role: id === session.user.id ? 'OWNER' : 'MEMBER'
        }))
      }
    }
  })

  revalidatePath('/chat')
  redirect(`/chat/${group.id}`)
}

export async function createDirectMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const targetId = formData.get('targetId') as string
  const initialMessage = formData.get('initialMessage') as string
  if (!targetId || targetId === session.user.id) throw new Error("Invalid target user")

  const existing = await prisma.chatGroup.findFirst({
    where: {
      type: 'DIRECT',
      AND: [
        { members: { some: { userId: session.user.id } } },
        { members: { some: { userId: targetId } } }
      ]
    }
  })

  let url = `/chat/${existing?.id}`
  if (!existing) {
    const group = await prisma.chatGroup.create({
      data: {
        name: null,
        type: 'DIRECT',
        organizationId: 'leeds',
        members: {
          create: [{ userId: session.user.id }, { userId: targetId }]
        }
      }
    })
    url = `/chat/${group.id}`
  }

  revalidatePath('/chat')
  if (initialMessage) {
    url += `?initialMessage=${encodeURIComponent(initialMessage)}`
  }
  redirect(url)
}

export async function sendMessage(data: { 
  groupId: string, 
  content: string, 
  type?: string,
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  replyToId?: string
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const { groupId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId } = data

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member of this chat")

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      groupId,
      type,
      fileUrl,
      fileName,
      fileSize,
      replyToId: replyToId || null,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      replyTo: {
        select: { 
          id: true, content: true, type: true, fileName: true,
          sender: { select: { id: true, name: true } }
        }
      },
      reactions: { include: { user: { select: { id: true, name: true } } } }
    }
  })

  revalidatePath(`/chat/${groupId}`)
  return message
}

export async function deleteMessage(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: { group: { include: { members: true } } }
  })

  if (!message) throw new Error("Message not found")
  
  const roleName = (session.user as any)?.roleName
  const isSender = message.senderId === session.user.id
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)

  if (!isSender && !isAdmin) throw new Error("Permission denied")

  await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, deletedAt: new Date(), deletedById: session.user.id }
  })

  revalidatePath(`/chat/${message.groupId}`)
}

export async function deleteManyMessages(messageIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify ownership of all messages
  const messages = await prisma.message.findMany({
    where: { id: { in: messageIds } }
  })

  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'IT Admin', 'Network Admin', 'Branch Admin'].includes(roleName)

  for (const msg of messages) {
    if (msg.senderId !== session.user.id && !isAdmin) {
      throw new Error("Permission denied: you can only delete your own messages")
    }
  }

  await prisma.message.updateMany({
    where: { id: { in: messageIds } },
    data: { isDeleted: true, deletedAt: new Date(), deletedById: session.user.id }
  })

  if (messages[0]?.groupId) revalidatePath(`/chat/${messages[0].groupId}`)
  return { success: true }
}

export async function pinMessage(messageId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const message = await prisma.message.findUnique({ where: { id: messageId } })
  if (!message) throw new Error("Message not found")

  // Verify membership
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId: message.groupId } }
  })
  if (!membership) throw new Error("Not a member of this chat")

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      isPinned: !message.isPinned,
      pinnedAt: !message.isPinned ? new Date() : null,
      pinnedById: !message.isPinned ? session.user.id : null,
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      replyTo: { 
        select: { 
          id: true, content: true, type: true, fileName: true,
          sender: { select: { id: true, name: true } }
        } 
      }
    }
  })

  revalidatePath(`/chat/${message.groupId}`)
  return updated
}

export async function toggleReaction(messageId: string, emoji: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existing = await prisma.messageReaction.findUnique({
    where: { userId_messageId: { userId: session.user.id, messageId } }
  })

  if (existing) {
    if (existing.emoji === emoji) {
      await prisma.messageReaction.delete({
        where: { userId_messageId: { userId: session.user.id, messageId } }
      })
    } else {
      await prisma.messageReaction.update({
        where: { userId_messageId: { userId: session.user.id, messageId } },
        data: { emoji }
      })
    }
  } else {
    await prisma.messageReaction.create({
      data: { messageId, userId: session.user.id, emoji }
    })
  }

  const updated = await prisma.message.findUnique({ 
    where: { id: messageId },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      reactions: { include: { user: { select: { id: true, name: true } } } },
      replyTo: { 
        select: { 
          id: true, content: true, type: true, fileName: true,
          sender: { select: { id: true, name: true } }
        } 
      }
    }
  })

  if (updated) revalidatePath(`/chat/${updated.groupId}`)
  return updated
}

export async function addGroupMember(groupId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify requester is a member
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member")

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId } },
    create: { userId, groupId },
    update: {}
  })

  revalidatePath(`/chat/${groupId}`)
  return { success: true }
}

export async function removeGroupMember(groupId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const actualUserId = userId === 'current' ? session.user.id : userId

  const group = await prisma.chatGroup.findUnique({ where: { id: groupId } })
  if (!group) throw new Error("Group not found")

  const roleName = (session.user as any)?.roleName
  const isAdmin = ['Super Admin', 'Corporate Admin', 'Module Admin'].includes(roleName)
  const isGroupAdmin = group.adminId === session.user.id
  const isSelf = actualUserId === session.user.id

  if (!isAdmin && !isGroupAdmin && !isSelf) throw new Error("Permission denied")

  await prisma.groupMember.delete({
    where: { userId_groupId: { userId: actualUserId, groupId } }
  })

  revalidatePath(`/chat/${groupId}`)
  revalidatePath('/chat')
  return { success: true }
}

export async function updateGroupInfo(groupId: string, data: { name?: string, description?: string, iconUrl?: string }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member")
  
  const isAuthorized = membership.role === 'OWNER' || membership.role === 'ADMIN'
  if (!isAuthorized) throw new Error("Only group owners and admins can update group info")

  await prisma.chatGroup.update({ where: { id: groupId }, data })

  revalidatePath(`/chat/${groupId}`)
  return { success: true }
}

export async function deleteChatGroup(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const group = await prisma.chatGroup.findUnique({
    where: { id: groupId },
    include: { members: true }
  })

  if (!group) throw new Error("Chat not found")

  const myMembership = group.members.find(m => m.userId === session.user.id)
  const isOwner = myMembership?.role === 'OWNER'
  const isDirect = group.type === 'DIRECT'

  if (!isDirect && !isOwner && !isAdminRole) {
    throw new Error("Only the group owner or platform admins can delete this chat")
  }

  await prisma.chatGroup.delete({ where: { id: groupId } })

  revalidatePath('/chat')
  return { success: true }
}

export async function forwardMessages(messageIds: string[], targetGroupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const messages = await prisma.message.findMany({
    where: { id: { in: messageIds } },
    orderBy: { createdAt: 'asc' }
  })

  if (messages.length === 0) return []

  const forwardedMessages = await Promise.all(messages.map(m => {
    return prisma.message.create({
      data: {
        content: m.content,
        type: m.type,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        fileSize: m.fileSize,
        senderId: session.user.id,
        groupId: targetGroupId
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        reactions: { include: { user: { select: { id: true, name: true } } } }
      }
    })
  }))

  revalidatePath(`/chat/${targetGroupId}`)
  return forwardedMessages
}

export async function getChatCategories() {
  return await prisma.chatGroupCategory.findMany({ orderBy: { name: 'asc' } })
}

export async function markAsRead(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.groupMember.update({
    where: { userId_groupId: { userId: session.user.id, groupId } },
    data: { lastReadAt: new Date() }
  })
}

export async function clearChatMessages(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member of this chat")

  await prisma.message.deleteMany({
    where: { groupId }
  })

  revalidatePath(`/chat/${groupId}`)
  revalidatePath('/chat')
  return { success: true }
}

export async function togglePinChat(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member")

  // Using raw SQL to bypass Prisma Client validation in case of stale client
  const newVal = !membership.isPinned ? 1 : 0
  await prisma.$executeRaw`UPDATE GroupMember SET isPinned = ${newVal} WHERE id = ${membership.id}`

  revalidatePath('/chat')
  return { success: true }
}

export async function toggleArchiveChat(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member")

  const newVal = !membership.isArchived ? 1 : 0
  await prisma.$executeRaw`UPDATE GroupMember SET isArchived = ${newVal} WHERE id = ${membership.id}`

  revalidatePath('/chat')
  return { success: true }
}

export async function toggleMuteChat(groupId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } }
  })
  if (!membership) throw new Error("Not a member")

  const newVal = !membership.isMuted ? 1 : 0
  await prisma.$executeRaw`UPDATE GroupMember SET isMuted = ${newVal} WHERE id = ${membership.id}`

  revalidatePath('/chat')
  return { success: true }
}

export async function toggleAdminRole(groupId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const group = await prisma.chatGroup.findUnique({
    where: { id: groupId },
    include: { members: true }
  })
  if (!group) throw new Error("Group not found")

  const myMembership = group.members.find(m => m.userId === session.user.id)
  if (myMembership?.role !== 'OWNER' && (session.user as any)?.roleName !== 'Super Admin') {
    throw new Error("Only the group owner can manage admin roles")
  }

  const targetMembership = group.members.find(m => m.userId === userId)
  if (!targetMembership) throw new Error("User is not a member of this group")
  if (targetMembership.role === 'OWNER') throw new Error("Cannot change owner role")

  const newRole = targetMembership.role === 'ADMIN' ? 'MEMBER' : 'ADMIN'
  
  await prisma.groupMember.update({
    where: { userId_groupId: { userId, groupId } },
    data: { role: newRole }
  })

  revalidatePath(`/chat/${groupId}`)
  return { success: true }
}
