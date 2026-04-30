'use client'

import { usePathname } from 'next/navigation'

export function ChatLayoutClient({ children, sidebar }: { children: React.ReactNode, sidebar: React.ReactNode }) {
  const pathname = usePathname()
  // Check if we are in a specific chat group
  // Path is usually /chat/[groupId]
  const isChatSelected = pathname.startsWith('/chat/') && pathname !== '/chat'

  return (
    <div className="flex h-screen bg-[#F8F9FC] pt-0 md:pt-4 pb-16 md:pb-4 px-0 md:px-4 gap-4 overflow-hidden">
      {/* LEFT: Conversations list */}
      <div className={`w-full md:w-80 lg:w-[360px] flex-col overflow-hidden shrink-0 bg-white rounded-[2rem] shadow-soft border border-gray-100 ${isChatSelected ? 'hidden md:flex' : 'flex'}`}>
        {sidebar}
      </div>
      
      {/* RIGHT: Active conversation */}
      <div className={`flex-1 flex-col overflow-hidden relative bg-white rounded-[2rem] shadow-soft border border-gray-100 ${isChatSelected ? 'flex' : 'hidden md:flex'}`}>
        {children}
      </div>
    </div>
  )
}
