import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { KnowledgeClient } from '@/components/knowledge/KnowledgeClient'

export default async function KnowledgePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const me = await prisma.user.findUnique({ 
    where: { id: session.user.id },
    include: { role: true, branch: true, employeeCategory: true }
  })
  const roleName = me?.role?.name || ''
  const isCorporateLeadership = me?.employeeCategory?.name === 'Corporate Leadership'
  const categoryId = me?.employeeCategory?.name // Using name for audience flag matching as per our publishContent logic

  // Query Approved Articles (Blog Articles)
  const articlesRaw = await prisma.article.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    include: { 
      author: { select: { name: true, image: true } }
    },
  })

  // Query Content Items
  const contentItemsRaw = await prisma.contentItem.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { name: true, image: true } }
    }
  })

  // Filter Content Items by Audience
  const filteredContentItems = contentItemsRaw.filter(item => {
    if (isCorporateLeadership) return true;
    if (!item.audienceFlags) return true;
    if (!categoryId) return false;
    
    const flags = item.audienceFlags.split(',').map(f => f.trim());
    return flags.includes(categoryId);
  })

  // Map Content Items to match the Article structure for KnowledgeClient
  const mappedContentItems = filteredContentItems.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    documentType: item.contentType, // 'SOP', 'POLICY', 'RESOURCE', 'ANNOUNCEMENT'
    mainCategory: item.mainCategory || 'Official',
    category: item.mainCategory || 'Official',
    subCategory: item.subCategory || null,
    imageUrl: null,
    pdfUrl: item.fileUrl,
    createdAt: item.createdAt,
    author: {
      name: item.createdBy.name,
      image: item.createdBy.image
    },
    isMultipart: false,
    reactions: [],
    comments: []
  }))

  // Convert mapped documentType to Title Case if needed (POLICY -> Policy)
  mappedContentItems.forEach(item => {
    if (item.documentType === 'POLICY') item.documentType = 'Policy';
    else if (item.documentType === 'RESOURCE') item.documentType = 'Resource';
    else if (item.documentType === 'ANNOUNCEMENT') item.documentType = 'Announcement';
  })

  // Manual Join for Polymorphic Relations (Comments & Reactions)
  const allComments = await prisma.comment.findMany({
    where: { entityType: 'ARTICLE' },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'asc' }
  })

  const allReactions = await prisma.reaction.findMany({
    where: { entityType: 'ARTICLE' },
    include: { user: { select: { name: true } } }
  })

  const articlesWithData = articlesRaw.map(a => ({
    ...a,
    comments: allComments.filter(c => c.entityId === a.id),
    reactions: allReactions.filter(r => r.entityId === a.id)
  }))

  const combinedData = [...articlesWithData, ...mappedContentItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <KnowledgeClient articles={combinedData} session={session} />
}
