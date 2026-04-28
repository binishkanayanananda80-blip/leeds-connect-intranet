import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false }, { status: 401 })

  const { groupId } = await req.json()
  if (!groupId) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    await prisma.groupMember.update({
      where: { userId_groupId: { userId: session.user.id, groupId } },
      data: { lastReadAt: new Date() }
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // fail silently
  }
}
