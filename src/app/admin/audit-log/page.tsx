import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AuditLogClient from './AuditLogClient'

export default async function AuditLogPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const roleName = (session.user as any)?.roleName || ''
  const isAdmin = ['Super Admin', 'Corporate Admin'].includes(roleName)
  if (!isAdmin) redirect('/admin')

  return <AuditLogClient />
}
