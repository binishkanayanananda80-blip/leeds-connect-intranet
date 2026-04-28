import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import EmployeeAdminClient from './EmployeeAdminClient'

export default async function EmployeeAdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const roleName = (session.user as any)?.roleName || ''
  const isAuthorized = ['Super Admin', 'Corporate Admin', 'Moderator'].includes(roleName)
  if (!isAuthorized) redirect('/intranet')

  return <EmployeeAdminClient roleName={roleName} />
}
