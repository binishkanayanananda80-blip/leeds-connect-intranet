'use client'

import { Pin, ChevronRight, X } from 'lucide-react'

interface PinnedMessageBarProps {
  pinnedMessages: any[]
  onJumpToMessage: (id: string) => void
  onUnpin: (id: string) => void
}

export function PinnedMessageBar({ pinnedMessages, onJumpToMessage, onUnpin }: PinnedMessageBarProps) {
  if (!pinnedMessages.length) return null

  const latest = pinnedMessages[0]

  return (
    <div className="bg-white border-b px-4 py-2 flex items-center gap-3 shadow-sm z-20 sticky top-0">
      <div className="p-2 bg-[#5A2D82]/10 rounded-lg text-primary shrink-0">
        <Pin size={16} />
      </div>
      <div 
        className="flex-1 min-w-0 cursor-pointer group"
        onClick={() => onJumpToMessage(latest.id)}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-[#5A2D82]">
          Pinned Message {pinnedMessages.length > 1 && `(${pinnedMessages.length})`}
        </p>
        <p className="text-xs text-gray-500 truncate group-hover:text-gray-800 transition-colors">
          <span className="font-bold text-gray-700">{latest.sender?.name}: </span>
          {latest.content || 'File attachment'}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
         <button 
           onClick={() => onUnpin(latest.id)}
           className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400"
         >
           <X size={14} />
         </button>
         <ChevronRight size={16} className="text-gray-300" />
      </div>
    </div>
  )
}
