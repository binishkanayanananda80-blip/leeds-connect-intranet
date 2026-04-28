'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Megaphone, Users, BookOpen, Heart,
  Star, Crown, LogOut, ChevronRight,
  Home, MessageCircle, Video, LayoutDashboard, Settings,
  Sparkles, Trophy
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { signOut, useSession } from 'next-auth/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const intranetGroups = [
  {
    label: 'LEEDS CONNECT',
    items: [
      { name: 'Dashboard',           href: '/intranet',               icon: Home },
      { name: 'Leeds News Feed',     href: '/intranet/announcements', icon: Megaphone },
      { name: 'Employee Directory',  href: '/intranet/directory',     icon: Users },
      { name: 'Leadership Hub',      href: '/intranet/leadership',    icon: Crown },
    ]

  },
  {
    label: 'RESOURCES',
    items: [
      { name: 'Knowledge Hub',       href: '/intranet/knowledge',     icon: BookOpen },
      { name: 'Welfare Hub',         icon: Heart,                   href: '/intranet/welfare' },
    ]
  },
  {
    label: 'CONNECT',
    items: [
      { name: 'Chat Hub',            href: '/chat',                 icon: MessageCircle },
      { name: 'Meeting Hub',         href: '/meetings',             icon: Video },
      { name: 'Birthday Wall',       href: '/intranet/birthday-wall', icon: Sparkles },
      { name: 'Celebrations',        href: '/intranet/celebrations',  icon: Trophy },
    ]
  }
]

export function IntranetSidebar({ 
  className,
  userName: propName,
  userRole: propRole 
}: { 
  className?: string,
  userName?: string,
  userRole?: string
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = propName || session?.user?.name
  const userRole = propRole || (session?.user as any)?.roleName

  return (
    <aside className={cn(
      'w-64 flex flex-col bg-primary rounded-[2.5rem] shadow-2xl border-none overflow-y-auto pb-12 transition-all duration-300 h-full',
      className
    )} suppressHydrationWarning>

      {/* Institutional Branding */}
      <div className="px-6 py-10 flex justify-center">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-36 h-36 rounded-[2rem] bg-white flex items-center justify-center border border-white/20 mb-2 shadow-xl p-2">
            <Image 
              src="/logo.png" 
              alt="Leeds Logo" 
              width={130} 
              height={130} 
              className="object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none uppercase">Leeds Connect</h1>
            <p className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase mt-2 leading-tight">Leeds International School<br/>Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-7">
        {intranetGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] px-3 pb-1">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/intranet' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-4 px-4 py-3 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all group relative',
                      isActive
                        ? 'bg-white text-primary shadow-xl'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    )}
                  >
                    <item.icon className={cn('shrink-0 transition-transform duration-300', isActive ? 'text-primary' : 'text-white/50 group-hover:text-white group-hover:scale-110')} size={18} />
                    <span className="flex-1 whitespace-nowrap">{item.name}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-gold-leeds" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-6 pb-4 mt-auto border-t border-white/10 pt-6 space-y-2">
        {['Super Admin', 'Module Admin', 'Moderator'].includes(userRole) && (
          <Link
            href="/admin"
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/90 hover:bg-white/10 transition-all group border border-white/10"
          >
            <Settings className="h-4 w-4 shrink-0 opacity-50" />
            <span>Admin Panel</span>
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-rose-500/20 transition-all group border border-white/5"
        >
          <LogOut className="h-4 w-4 shrink-0 opacity-50" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
