'use client';

import { usePathname } from 'next/navigation'
import { Bell, Search, MessageCircle, Video, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useSession } from 'next-auth/react'


export function TopNav({ 
  unreadCount = 0, 
  userName = '', 
  userRole = '',
  userImage = ''
}: { 
  unreadCount?: number,
  userName?: string,
  userRole?: string,
  userImage?: string
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const user = session?.user
  const isLoading = status === 'loading'
  

  const sessionRoleName = (user as any)?.roleName?.replace(/_/g, ' ') || ''

  
  // Use passed props if session is not yet loaded, otherwise prefer session data for interactivity
  const displayName = user?.name || userName || ''
  const displayRole = sessionRoleName || userRole || (isLoading ? '' : 'Staff Member')
  const displayImage = user?.image || userImage || ''

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between mb-6 sm:mb-8" suppressHydrationWarning>
      {/* Brand Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <Image src="/logo.png" alt="Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center leading-[1.1] sm:leading-normal">
          <span className="font-black text-primary text-[12px] sm:text-lg uppercase tracking-tight">Leeds</span>
          <span className="font-black text-primary text-[12px] sm:text-lg uppercase tracking-tight sm:ml-1.5">Connect</span>
        </div>
      </div>

      {/* Desktop Search - Elite Pill */}
      <div className="flex-1 max-w-xl hidden sm:block mx-8">
        <div className="relative group">
          <Search className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-all" />
          <input 
            type="text" 
            placeholder="Search Intelligence Center..." 
            className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/5 focus:bg-white rounded-2xl pl-14 pr-6 py-3 text-[11px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-gray-400 shadow-inner"
          />
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="hidden sm:flex items-center gap-2 pr-6 border-r border-gray-100">
          <Link href="/chat" className="p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
            <MessageCircle className="w-5 h-5" />
          </Link>
          <Link href="/meetings" className="p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
            <Video className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white" />
            )}
          </Link>
        </div>
        
        {/* User Profile Pill */}
        <Link href="/profile/edit" className="flex items-center gap-3 sm:gap-4 py-1 sm:pr-1 sm:pl-4 rounded-3xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-black text-gray-900 leading-none mb-1.5">{displayName}</p>
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em]">{displayRole}</p>
          </div>
          <UserAvatar
            imageUrl={displayImage}
            name={displayName}
            size="md"
            className="ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all shrink-0"
          />
        </Link>
      </div>
    </header>
  )
}
