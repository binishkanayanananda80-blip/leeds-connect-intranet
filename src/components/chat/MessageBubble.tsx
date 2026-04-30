'use client'

import { format, isToday, isYesterday } from 'date-fns'
import { Check, CheckCheck, ChevronDown, Reply, Forward, Pin, Star, Trash2, FileIcon, ImageIcon, Download, Mic } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'
import { ANIMATED_EMOJIS } from './EmojiPicker'

const BASE_EMOJI_URL = 'https://fonts.gstatic.com/s/e/notoemoji/latest'
const EMOJI_REGEX = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}])/gu;

interface MessageBubbleProps {
  message: any
  currentUserId: string
  isGroup: boolean
  onReply: (msg: any) => void
  onForward: (msg: any) => void
  onPin: (msgId: string) => void
  onDelete: (msgId: string) => void
  onReact: (msgId: string, emoji: string) => void
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

export function MessageBubble({ message, currentUserId, isGroup, onReply, onForward, onPin, onDelete, onReact }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const isMe = message.senderId === currentUserId
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
        setShowReactions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const renderContentWith3DEmojis = () => {
    const content = message.content || ''
    if (message.type === 'VOICE') return null

    // Check if message is ONLY emojis (1-3) for "Big Emoji" mode
    const trimmedContent = content.trim()
    const emojiMatches = trimmedContent.match(EMOJI_REGEX)
    const isOnlyEmojis = trimmedContent.replace(EMOJI_REGEX, '').trim().length === 0
    const isBigEmoji = isOnlyEmojis && emojiMatches && emojiMatches.length <= 3

    const parts = content.split(EMOJI_REGEX)
    
    return (
      <div className={`flex flex-wrap items-center gap-1 mb-1 ${isMe ? 'justify-end text-right' : 'justify-start text-left'} ${isBigEmoji ? 'py-4' : ''}`}>
        {parts.map((part, index) => {
          if (EMOJI_REGEX.test(part)) {
            const emojiInfo = ANIMATED_EMOJIS[part]
            if (emojiInfo) {
              return (
                <img 
                  key={index}
                  src={`${BASE_EMOJI_URL}/${emojiInfo.hex}/512.gif`}
                  alt={part}
                  className={isBigEmoji ? 'w-24 h-24' : 'w-7 h-7 inline-block align-bottom mx-0.5'}
                />
              )
            }
          }
          return part ? (
            <span key={index} className={`text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
              isMe ? 'text-[#5A2D82] font-semibold' : 'text-gray-800'
            } ${isBigEmoji ? 'hidden' : ''}`}>
              {part}
            </span>
          ) : null
        })}
      </div>
    )
  }

  const renderFile = () => {
    if (message.type === 'IMAGE' || (message.type === 'FILE' && message.fileUrl?.match(/\.(jpg|jpeg|png|gif)$/i))) {
      return (
        <div className="relative group/img cursor-pointer mb-1 overflow-hidden rounded-xl border border-black/5">
          <img src={message.fileUrl} alt={message.fileName} className="max-w-full h-auto max-h-80 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
             <a href={message.fileUrl} download className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40">
                <Download size={20} />
             </a>
          </div>
        </div>
      )
    }
    if (message.type === 'FILE') {
      return (
        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-2 rounded-xl border mb-1 transition-colors ${isMe ? 'border-[#5A2D82]/20 hover:bg-[#5A2D82]/5' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isMe ? 'bg-[#5A2D82]/10 text-[#5A2D82]' : 'bg-gray-100 text-gray-500'}`}>
            <FileIcon size={18} />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={`text-xs sm:text-sm font-bold truncate ${isMe ? 'text-[#5A2D82]' : 'text-gray-700'}`}>{message.fileName}</p>
            <p className="text-[10px] uppercase font-bold tracking-tighter text-gray-400">
               {message.fileSize ? (message.fileSize / 1024).toFixed(1) + ' KB' : 'Document'} · PDF
            </p>
          </div>
          <Download size={14} className="text-gray-300" />
        </a>
      )
    }
    if (message.type === 'VOICE') {
      return (
        <div className={`flex items-center gap-3 p-2 rounded-2xl mb-1 ${isMe ? 'bg-[#5A2D82]/5' : 'bg-gray-50/50'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMe ? 'bg-[#5A2D82] text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
            <Mic size={20} />
          </div>
          <div className="flex-1 min-w-[180px]">
             <audio src={message.fileUrl} controls className="w-full h-8 custom-audio opacity-80" />
             <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Voice Message</span>
                {message.fileSize && <span className="text-[10px] font-bold text-gray-400">{(message.fileSize / 1024).toFixed(0)} KB</span>}
             </div>
          </div>
        </div>
      )
    }
    return null
  }

  const renderReactions = () => {
    if (!message.reactions?.length) return null
    const counts: Record<string, number> = {}
    message.reactions.forEach((r: any) => counts[r.emoji] = (counts[r.emoji] || 0) + 1)
    
    return (
      <div className={`absolute -bottom-3 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 z-10`}>
        {Object.entries(counts).map(([emoji, count]) => (
          <button 
            key={emoji}
            onClick={() => onReact(message.id, emoji)}
            className="flex items-center gap-1 bg-white border border-gray-100 rounded-full px-1.5 py-0.5 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-xs">{emoji}</span>
            {count > 1 && <span className="text-[10px] font-bold text-gray-500">{count}</span>}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={`flex flex-col mb-4 px-4 ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`relative group max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Reply Preview */}
        {message.replyTo && (
          <div className={`mb-1 z-0 opacity-80 scale-[0.98] origin-bottom px-3 py-2 rounded-xl border-l-4 ${
            isMe ? 'bg-[#5A2D82]/5 border-[#5A2D82]' : 'bg-gray-100 border-gray-400'
          }`}>
             <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
               {message.replyTo.sender?.name || 'Unknown'}
             </p>
              <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-1 italic">
               {message.replyTo.content || 'File Attachment'}
             </p>
          </div>
        )}

        <div className={`relative py-1 w-full ${
          isMe ? 'text-right' : 'text-left'
        }`}>
          {/* Group Sender Name */}
          {isGroup && !isMe && (
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-1.5" style={{ color: '#5A2D82' }}>
              {message.sender?.name || 'Staff'}
            </p>
          )}

          {/* Pin Badge */}
          {message.pinnedAt && (
            <div className={`flex items-center gap-1 text-[10px] font-bold opacity-60 mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <Pin size={10} /> Pinned
            </div>
          )}

          <div className="mb-1.5">
            {renderFile()}
          </div>

          {renderContentWith3DEmojis()}

          <div className={`flex flex-col min-w-[60px] ${isMe ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-1 mt-1 opacity-40 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">
                {format(new Date(message.createdAt), 'h:mm a')}
              </span>
              {isMe && (
                <CheckCheck size={12} className={message.isRead ? 'text-blue-500' : 'text-gray-400'} />
              )}
            </div>
          </div>

          {/* Reaction Trigger Button */}
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`absolute top-1 ${isMe ? '-left-8' : '-right-8'} p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 rounded-full text-gray-400`}
          >
            <ChevronDown size={16} />
          </button>

          {renderReactions()}
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div ref={menuRef} className={`absolute z-50 top-8 ${isMe ? 'right-0' : 'left-0'} w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95`}>
            <div className="px-2 py-1 flex items-center justify-between border-b border-gray-50 mb-1">
              {REACTIONS.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => { onReact(message.id, emoji); setShowMenu(false); }}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors transform hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button onClick={() => { onReply(message); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-tighter transition-colors">
              <Reply size={14} className="text-gray-400" /> Reply
            </button>
            <button onClick={() => { onForward(message); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-tighter transition-colors">
              <Forward size={14} className="text-gray-400" /> Forward
            </button>
            <button onClick={() => { onPin(message.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 uppercase tracking-tighter transition-colors">
              <Pin size={14} className="text-gray-400" /> {message.pinnedAt ? 'Unpin' : 'Pin'}
            </button>
            <button onClick={() => { onDelete(message.id); setShowMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 uppercase tracking-tighter transition-colors">
              <Trash2 size={14} className="text-red-400" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
