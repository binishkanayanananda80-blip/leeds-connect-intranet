'use client'

import { IntranetSidebar } from '@/components/layout/IntranetSidebar'

interface NavigationShellProps {
  unreadCount: number
  userName: string
  userRole: string
  activeModules?: string
  permissionRank?: number | null
}

export function NavigationShell({ unreadCount, userName, userRole, activeModules, permissionRank }: NavigationShellProps) {
  return (
    <IntranetSidebar 
      className="hidden md:flex" 
      userName={userName}
      userRole={userRole}
    />
  )
}
