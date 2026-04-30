'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Menu, Paperclip as PaperclipIcon, Mic, Smile, MoreVertical, Trash2, CheckCheck, RefreshCw, FileIcon, ImageIcon, Download, X as CloseIcon, Share2, Square, CheckSquare, Search, Info, Pin, ChevronDown } from 'lucide-react'
import { sendMessage, deleteMessage, deleteChatGroup, forwardMessages, toggleReaction, pinMessage } from '../actions'
import { ForwardModal } from '@/components/chat/ForwardModal'
import { DeleteConversationModal } from '@/components/chat/DeleteConversationModal'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { PinnedMessageBar } from '@/components/chat/PinnedMessageBar'
import { GroupInfoPanel } from '@/components/chat/GroupInfoPanel'
import { EmojiPicker } from '@/components/chat/EmojiPicker'
import { getSocket } from '@/lib/socket'
import { useDropzone } from 'react-dropzone'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

export function ChatWindow({ title, avatarUrl, messages: initialMessages, currentUserId, groupId, currentUser, allGroups = [], availableUsers = [], group: groupData }: any) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [messages, setMessages] = useState(initialMessages)
  const [content, setContent] = useState('')
  const [isTyping, setIsTyping] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyTo, setReplyTo] = useState<any>(null)
  const [forwardModalOpen, setForwardModalOpen] = useState(false)
  const [forwardMsg, setForwardMsg] = useState<any>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const socket = getSocket(currentUserId)

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior })
    }
  }, [])

  useEffect(() => {
    setMessages(initialMessages)
    setTimeout(() => scrollToBottom('auto'), 100)
    fetch('/api/chat/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId })
    }).catch(() => {})
  }, [groupId, scrollToBottom])

  // Socket Events
  useEffect(() => {
    socket.emit('join-room', groupId)
    
    socket.on('new-message', (msg: any) => {
      setMessages((prev: any) => prev.some((m: any) => m.id === msg.id) ? prev : [...prev, msg])
      scrollToBottom()
    })

    socket.on('message-updated', (updatedMsg: any) => {
      setMessages((prev: any) => prev.map((m: any) => m.id === updatedMsg.id ? updatedMsg : m))
    })

    socket.on('message-deleted', (messageId: string) => {
      setMessages((prev: any) => prev.filter((m: any) => m.id !== messageId))
    })

    socket.on('user-typing', (data: any) => {
      setIsTyping((prev) => prev.some(u => u.userId === data.userId) ? prev : [...prev, data])
    })

    socket.on('user-typing-stop', (data: any) => {
      setIsTyping((prev) => prev.filter(u => u.userId !== data.userId))
    })

    return () => {
      socket.off('new-message')
      socket.off('message-updated')
      socket.off('message-deleted')
      socket.off('user-typing')
      socket.off('user-typing-stop')
    }
  }, [socket, groupId, scrollToBottom])

  // Handlers
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!content.trim() && !pendingBlob) return
    
    const msgContent = content
    const replyId = replyTo?.id
    setContent('')
    setReplyTo(null)
    socket.emit('typing-stop', { groupId, userId: currentUserId })

    try {
      const savedMsg = await sendMessage({ 
        groupId, 
        content: msgContent, 
        type: 'TEXT',
        replyToId: replyId
      })
      setMessages((prev: any) => [...prev, savedMsg])
      socket.emit('send-message', { groupId, message: savedMsg })
      scrollToBottom()
    } catch (error: any) {
      alert('Failed to send: ' + error.message)
      setContent(msgContent)
    }
  }

  const handlePin = async (messageId: string) => {
    const updated = await pinMessage(messageId)
    if (updated) {
      setMessages((prev: any) => prev.map((m: any) => m.id === messageId ? updated : m))
      socket.emit('update-message', { groupId, message: updated })
    }
  }

  const handleReact = async (messageId: string, emoji: string) => {
    const updated = await toggleReaction(messageId, emoji)
    if (updated) {
      setMessages((prev: any) => prev.map((m: any) => m.id === messageId ? updated : m))
      socket.emit('update-message', { groupId, message: updated })
    }
  }

  const handleDelete = async (messageId: string) => {
    if (confirm('Delete this message for everyone?')) {
      await deleteMessage(messageId)
      setMessages((prev: any) => prev.filter((m: any) => m.id !== messageId))
      socket.emit('delete-message', { groupId, messageId })
    }
  }

  const handleForward = async (targetGroupId: string) => {
    if (!forwardMsg) return
    try {
      const results = await forwardMessages([forwardMsg.id], targetGroupId)
      if (targetGroupId === groupId) {
        setMessages((prev: any) => [...prev, ...results])
        results.forEach(msg => socket.emit('send-message', { groupId, message: msg }))
      } else {
        alert('Message forwarded successfully')
      }
    } catch (err) {
      alert('Failed to forward message')
    } finally {
      setForwardModalOpen(false)
      setForwardMsg(null)
    }
  }

  // File Upload Logic
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    setIsUploading(true)
    
    for (const file of acceptedFiles) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await fetch('/api/chat/upload', { method: 'POST', body: formData })
        const data = await res.json()
        const type = data.mimeType.startsWith('image/') ? 'IMAGE' : (data.mimeType.startsWith('video/') ? 'VIDEO' : 'FILE')
        
        const savedMsg = await sendMessage({ 
          groupId, 
          content: `Sent a ${type.toLowerCase()}`, 
          type,
          fileUrl: data.url,
          fileName: data.fileName,
          fileSize: data.fileSize
        })
        setMessages((prev: any) => [...prev, savedMsg])
        socket.emit('send-message', { groupId, message: savedMsg })
      } catch (e) {
        console.error('Upload failed', e)
      }
    }
    setIsUploading(false)
    scrollToBottom()
  }, [groupId, socket, scrollToBottom])

  const { getRootProps, getInputProps, open } = useDropzone({ onDrop, noClick: true })

  // Pinned Messages
  const pinnedMessages = useMemo(() => messages.filter((m: any) => m.isPinned).sort((a: any, b: any) => new Date(b.pinnedAt).getTime() - new Date(a.pinnedAt).getTime()), [messages])

  // Date Grouping
  const groupedMessages = useMemo(() => {
    const groups: { date: Date, msgs: any[] }[] = []
    messages.forEach((m: any) => {
      const d = new Date(m.createdAt)
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && isSameDay(lastGroup.date, d)) {
        lastGroup.msgs.push(m)
      } else {
        groups.push({ date: d, msgs: [m] })
      }
    })
    return groups
  }, [messages])

  const renderDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMMM d, yyyy')
  }

  // Voice Recording
  const [isRecording, setIsRecording] = useState(false)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<any>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        setAudioPreview(URL.createObjectURL(blob))
        setPendingBlob(blob)
      }
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000)
    } catch (e) {
      alert('Microphone access denied')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const handleSendVoice = async () => {
    if (!pendingBlob) return
    setIsUploading(true)
    const file = new File([pendingBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' })
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/chat/upload', { method: 'POST', body: formData })
      const data = await res.json()
      const savedMsg = await sendMessage({ 
        groupId, 
        content: 'Voice message', 
        type: 'VOICE',
        fileUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize
      })
      setMessages((prev: any) => [...prev, savedMsg])
      socket.emit('send-message', { groupId, message: savedMsg })
      setAudioPreview(null)
      setPendingBlob(null)
    } catch (e) {
      console.error('Voice upload failed', e)
    } finally {
      setIsUploading(false)
      scrollToBottom()
    }
  }

  const handleInputChange = (e: any) => {
    setContent(e.target.value)
    socket.emit('typing-start', { groupId, userId: currentUserId, userName: currentUser?.name })
  }

  const handlePaste = (e: any) => {
    const files = Array.from(e.clipboardData.files) as File[]
    if (files.length) onDrop(files)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div {...getRootProps()} className="flex flex-col h-full bg-[#E5DDD5] relative overflow-hidden font-sans">
      <input {...getInputProps()} />
      
      {/* Header */}
      <header className="px-4 py-2 border-b bg-[#F0F2F5] flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfo(true)}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {avatarUrl ? <img src={avatarUrl} alt={title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-[#5A2D82] text-white font-bold">{title.charAt(0)}</div>}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate text-sm sm:text-[15px]">{title}</h2>
            <p className="text-[10px] sm:text-[12px] text-gray-500 truncate">
              {isTyping.length > 0 ? `${isTyping[0].userName} is typing...` : (groupData?.type === 'GROUP' ? `${groupData.members.length} members` : 'online')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <Search size={20} />
          </button>
          <button onClick={() => setShowInfo(true)} className="p-2 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Pinned Messages */}
      <PinnedMessageBar 
        pinnedMessages={pinnedMessages} 
        onJumpToMessage={(id) => {
          const el = document.getElementById(`msg-${id}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }} 
        onUnpin={handlePin} 
      />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundColor: '#E5DDD5' }}
      >
        {groupedMessages.map((group, gIdx) => (
          <div key={gIdx} className="space-y-2">
            <div className="flex justify-center my-4">
              <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold text-gray-500 shadow-sm uppercase tracking-wider">
                {renderDateLabel(group.date)}
              </span>
            </div>
            {group.msgs.map((m) => (
              <div id={`msg-${m.id}`} key={m.id}>
                <MessageBubble 
                  message={m} 
                  currentUserId={currentUserId} 
                  isGroup={groupData?.type === 'GROUP'}
                  onReply={setReplyTo}
                  onForward={(msg) => { setForwardMsg(msg); setForwardModalOpen(true); }}
                  onPin={handlePin}
                  onDelete={handleDelete}
                  onReact={handleReact}
                />
              </div>
            ))}
          </div>
        ))}
        <div className="h-4" />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-white border-t flex items-center gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex-1 bg-gray-50 rounded-lg p-2 border-l-4 border-[#5A2D82] text-sm truncate">
            <p className="font-bold text-[#5A2D82] text-[10px] sm:text-xs uppercase">{replyTo.sender?.name}</p>
            <p className="text-gray-500 truncate">{replyTo.content || 'File attachment'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
            <CloseIcon size={18} />
          </button>
        </div>
      )}

      {/* Voice Recording Bar */}
      {isRecording && (
        <div className="px-4 py-3 bg-white border-t flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 text-red-500">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest">{formatTime(recordingTime)}</span>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Recording voice message...</p>
          <button onClick={stopRecording} className="text-red-500 font-bold text-xs uppercase hover:bg-red-50 px-3 py-1 rounded-full transition-colors">Stop</button>
        </div>
      )}

      {/* Audio Preview Bar */}
      {audioPreview && !isRecording && (
        <div className="px-4 py-3 bg-white border-t flex items-center gap-4 animate-in slide-in-from-bottom-2">
          <button onClick={() => { setAudioPreview(null); setPendingBlob(null); }} className="text-gray-400 hover:text-red-500"><Trash2 size={20} /></button>
          <audio src={audioPreview} controls className="flex-1 h-8" />
          <button onClick={handleSendVoice} className="w-10 h-10 bg-[#5A2D82] text-white rounded-full flex items-center justify-center shadow-md"><Send size={18} className="ml-0.5" /></button>
        </div>
      )}

      {/* Input Area */}
      {!isRecording && !audioPreview && (
        <footer className="p-2 bg-[#F0F2F5] border-t flex items-end gap-2 shrink-0 relative">
          <div className="relative">
            {showEmojiPicker && (
              <EmojiPicker 
                onSelect={(emoji) => {
                  setContent(prev => prev + emoji)
                  setShowEmojiPicker(false)
                }} 
                onClose={() => setShowEmojiPicker(false)} 
              />
            )}
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2.5 hover:bg-gray-200 rounded-full transition-colors shrink-0 ${showEmojiPicker ? 'text-[#5A2D82] bg-gray-200' : 'text-gray-600'}`}>
              <Smile size={24} />
            </button>
          </div>
          <button onClick={open} className="p-2.5 hover:bg-gray-200 rounded-full text-gray-600 transition-colors shrink-0">
            <PaperclipIcon size={24} className="rotate-45" />
          </button>
          
          <div className="flex-1 bg-white rounded-[24px] px-4 py-2 border border-transparent focus-within:border-gray-200 shadow-sm">
            <textarea 
              rows={1}
              value={content}
              onChange={handleInputChange}
              onPaste={handlePaste}
              onFocus={() => setShowEmojiPicker(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Type a message" 
              className="w-full bg-transparent border-none focus:ring-0 text-sm sm:text-[15px] leading-6 resize-none max-h-32 py-1 outline-none"
            />
          </div>

          <button 
            onClick={content.trim() ? () => handleSend() : startRecording}
            className="w-12 h-12 bg-[#5A2D82] hover:bg-[#4A256B] text-white rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md shrink-0"
          >
            {content.trim() ? <Send size={20} className="ml-0.5" /> : <Mic size={20} />}
          </button>
        </footer>
      )}

      {/* Overlays */}
      {searchOpen && (
        <div className="absolute top-0 right-0 w-full h-[60px] bg-white z-50 flex items-center px-4 gap-4 shadow-md animate-in slide-in-from-right">
          <button onClick={() => setSearchOpen(false)} className="text-gray-400"><CloseIcon size={20} /></button>
          <div className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <input 
              autoFocus
              placeholder="Search in chat..." 
              className="bg-transparent flex-1 text-sm outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[100] flex items-center justify-center">
           <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#5A2D82] animate-spin" />
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Uploading files...</p>
           </div>
        </div>
      )}

      <GroupInfoPanel 
        isOpen={showInfo} 
        onClose={() => setShowInfo(false)} 
        group={groupData} 
        currentUserId={currentUserId}
        availableUsers={availableUsers}
      />

      {forwardModalOpen && (
        <ForwardModal 
          onClose={() => { setForwardModalOpen(false); setForwardMsg(null); }}
          onForward={handleForward}
          groups={allGroups}
          currentUserId={currentUserId}
          isMultiple={false}
        />
      )}
    </div>
  )
}
