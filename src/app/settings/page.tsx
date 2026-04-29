import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  // Redirecting to profile edit as the intermediate settings dashboard is no longer needed
  redirect('/profile/edit')
}
