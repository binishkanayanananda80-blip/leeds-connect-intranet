'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { format, isToday, isYesterday } from 'date-fns'
import { Search, Plus, MessageSquare, Users, Check, X, ChevronDown, Pin, Archive, BellOff, Trash2, LogOut, Camera } from 'lucide-react'
import { createGroupChat, createDirectMessage, markAsRead, removeGroupMember, clearChatMessages, togglePinChat, toggleArchiveChat, toggleMuteChat, deleteChatGroup } from './actions'

function cn(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(' ') }

const SENDER_COLORS = ['#7c3aed','#2563eb','#059669','#d97706','#dc2626','#0891b2','#7c3aed']
function getSenderColor(id: string) { return SENDER_COLORS[id.charCodeAt(0) % SENDER_COLORS.length] }

function getTime(d: string) {
  const date = new Date(d)
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd/MM/yy')
}

function Avatar({ name, image, size = 'md', color }: any) {
  const s = size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-12 h-12 text-base'
  if (image) return <img src={image} alt={name} className={`${s} rounded-full object-cover shrink-0`} />
  return (
    <div className={`${s} rounded-full flex items-center justify-center text-white font-bold shrink-0`} style={{ background: color || '#5A2D82' }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function ConvName({ group, currentUserId }: any) {
  if (group.type === 'GROUP') return <>{group.name || 'Group'}</>
  const other = group.members?.find((m: any) => m.userId !== currentUserId)
  return <>{other?.user?.name || 'Unknown'}</>
}

function ConvAvatar({ group, currentUserId, size = 'md' }: any) {
  if (group.type === 'GROUP') {
    if (group.iconUrl) return <img src={group.iconUrl} alt="group" className={`${size === 'md' ? 'w-12 h-12' : 'w-14 h-14'} rounded-full object-cover shrink-0`} />
    return <Avatar name={group.name} size={size} color="#5A2D82" />
  }
  const other = group.members?.find((m: any) => m.userId !== currentUserId)
  return <Avatar name={other?.user?.name} image={other?.user?.image} size={size} color={getSenderColor(other?.userId || '')} />
}

// ── CONVERSATION CONTEXT MENU ──
function ConvMenu({ groupId, type, isPinned, isArchived, isMuted, isOwner, onClose }: any) {
  const handleAction = async (label: string) => {
    switch (label) {
      case 'Archive chat':
      case 'Unarchive chat':
        await toggleArchiveChat(groupId)
        break
      case 'Mute notifications':
      case 'Unmute notifications':
        await toggleMuteChat(groupId)
        break
      case 'Pin chat':
      case 'Unpin chat':
        await togglePinChat(groupId)
        break
      case 'Mark as read':
        await markAsRead(groupId)
        break
      case 'Clear chat':
        if (confirm('Clear all messages in this chat?')) {
          await clearChatMessages(groupId)
        }
        break
      case 'Exit group':
        if (confirm('Exit this group?')) {
          await removeGroupMember(groupId, 'current')
        }
        break
      case 'Delete group':
      case 'Delete chat':
        if (confirm(`Permanently delete this ${type === 'GROUP' ? 'group' : 'chat'} for everyone?`)) {
          await deleteChatGroup(groupId)
        }
        break
    }
    onClose()
  }

  const items = [
    { icon: Archive, label: isArchived ? 'Unarchive chat' : 'Archive chat' },
    { icon: BellOff, label: isMuted ? 'Unmute notifications' : 'Mute notifications' },
    { icon: Pin, label: isPinned ? 'Unpin chat' : 'Pin chat' },
    { icon: Check, label: 'Mark as read' },
    { icon: Trash2, label: 'Clear chat', danger: true },
    type === 'DIRECT' 
      ? { icon: Trash2, label: 'Delete chat', danger: true }
      : isOwner 
        ? { icon: Trash2, label: 'Delete group', danger: true } 
        : { icon: LogOut, label: 'Exit group', danger: true },
  ].filter(Boolean) as any[]
  return (
    <div className="absolute right-0 top-0 z-50 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
      {items.map(item => (
        <button key={item.label} onClick={() => handleAction(item.label)} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${item.danger ? 'text-red-500' : 'text-gray-700'}`}>
          <item.icon size={16} className="shrink-0" />
          {item.label}
        </button>
      ))}
    </div>
  )
}

// ── NEW GROUP MODAL ──
function NewGroupModal({ users, categories, currentUserId, onClose }: any) {
  const [step, setStep] = useState<'members' | 'info'>('members')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [search, setSearch] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const filtered = users.filter((u: any) => u.id !== currentUserId && (u.name || '').toLowerCase().includes(search.toLowerCase()))
  const toggle = (id: string) => setSelectedMembers(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleSubmit = async () => {
    if (!name.trim() || selectedMembers.length === 0) return
    setIsPending(true)
    const fd = new FormData()
    fd.set('name', name); fd.set('description', description); fd.set('categoryId', categoryId); fd.set('iconUrl', iconUrl)
    selectedMembers.forEach(id => fd.append('members', id))
    await createGroupChat(fd)
  }

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/chat/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setIconUrl(data.url)
    } catch (err) {
      alert('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#5A2D82] px-5 py-4 flex items-center gap-3">
          <button onClick={step === 'members' ? onClose : () => setStep('members')} className="text-white/70 hover:text-white">
            {step === 'members' ? <X size={20} /> : <ChevronDown size={20} className="rotate-90" />}
          </button>
          <h2 className="text-white font-bold text-lg">{step === 'members' ? 'Add Members' : 'New Group'}</h2>
        </div>

        {step === 'members' ? (
          <>
            <div className="p-3 border-b">
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[32px]">
                {selectedMembers.map(id => {
                  const u = users.find((x: any) => x.id === id)
                  return (
                    <span key={id} className="flex items-center gap-1 bg-[#5A2D82]/10 text-[#5A2D82] text-xs font-bold px-2 py-1 rounded-full">
                      {u?.name?.split(' ')[0]}
                      <button onClick={() => toggle(id)}><X size={10} /></button>
                    </span>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
                <Search size={14} className="text-gray-400" />
                <input autoFocus placeholder="Search name..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.map((u: any) => (
                <button key={u.id} onClick={() => toggle(u.id)} className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedMembers.includes(u.id) ? 'bg-[#5A2D82]/5' : ''}`}>
                  <Avatar name={u.name} image={u.image} color={getSenderColor(u.id)} />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{u.role?.name || 'Staff'}</p>
                  </div>
                  {selectedMembers.includes(u.id) && <div className="w-5 h-5 rounded-full bg-[#5A2D82] flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                </button>
              ))}
            </div>
            {selectedMembers.length > 0 && (
              <div className="p-4 border-t">
                <button onClick={() => setStep('info')} className="w-full bg-[#5A2D82] text-white font-bold py-3 rounded-full">
                  Next ({selectedMembers.length} members) →
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-5 space-y-4 flex-1">
              <div className="flex items-center gap-4">
                <label className="relative group cursor-pointer shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl overflow-hidden border-2 border-gray-100">
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-[#5A2D82] border-t-transparent rounded-full animate-spin" />
                    ) : iconUrl ? (
                      <img src={iconUrl} alt="icon" className="w-full h-full object-cover" />
                    ) : (
                      '📁'
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={16} className="text-white" />
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleIconUpload} />
                </label>
                <input placeholder="Group name *" value={name} onChange={e => setName(e.target.value)} className="flex-1 border-b-2 border-gray-200 focus:border-[#5A2D82] py-2 text-sm font-semibold outline-none transition-colors" />
              </div>
              <input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="w-full border-b border-gray-100 py-2 text-sm outline-none" />
              {categories?.length > 0 && (
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full border-b border-gray-100 py-2 text-sm outline-none bg-transparent">
                  <option value="">Category (optional)</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
            </div>
            <div className="p-4 border-t">
              <button onClick={handleSubmit} disabled={!name.trim() || isPending} className="w-full bg-[#5A2D82] text-white font-bold py-3 rounded-full disabled:opacity-50">
                {isPending ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── NEW DM MODAL ──
function NewDMModal({ users, currentUserId, onClose }: any) {
  const [search, setSearch] = useState('')
  const filtered = users.filter((u: any) => u.id !== currentUserId && (u.name || '').toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-[#5A2D82] px-5 py-4 flex items-center gap-3">
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>
          <h2 className="text-white font-bold text-lg">New Direct Message</h2>
        </div>
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2">
            <Search size={14} className="text-gray-400" />
            <input autoFocus placeholder="Search name..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {filtered.map((u: any) => (
            <form key={u.id} action={createDirectMessage} onSubmit={onClose}>
              <input type="hidden" name="targetId" value={u.id} />
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <Avatar name={u.name} image={u.image} size="sm" color={getSenderColor(u.id)} />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.designation || u.role?.name || 'Staff'}</p>
                </div>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── MAIN SIDEBAR ──
export function ChatSidebar({ groups, availableUsers, currentUserId, currentUser, categories }: any) {
  const pathname = usePathname()
  const [tab, setTab] = useState<'all' | 'unread' | 'groups'>('all')
  const [search, setSearch] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showNewDM, setShowNewDM] = useState(false)

  // Reset modals on navigation
  useEffect(() => {
    setShowNewGroup(false)
    setShowNewDM(false)
  }, [pathname])

  const [contextMenu, setContextMenu] = useState<{ groupId: string, x: number, y: number, isPinned: boolean, isArchived: boolean, isMuted: boolean } | null>(null)

  const unreadTotal = groups.reduce((s: number, g: any) => s + (g.unreadCount || 0), 0)
  const groupCount = groups.filter((g: any) => g.type === 'GROUP').length

  const filtered = useMemo(() => {
    let list = [...groups]
    
    // Sort: Pinned first, then by updatedAt
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    if (tab === 'unread') list = list.filter((g: any) => g.unreadCount > 0 && !g.isArchived)
    if (tab === 'groups') list = list.filter((g: any) => g.type === 'GROUP' && !g.isArchived)
    if (tab === 'all') list = list.filter((g: any) => !g.isArchived)
    if (tab as string === 'archived') list = list.filter((g: any) => g.isArchived)

    if (search) list = list.filter((g: any) => {
      const name = g.type === 'GROUP' ? g.name : g.members?.find((m: any) => m.userId !== currentUserId)?.user?.name
      return (name || '').toLowerCase().includes(search.toLowerCase())
    })
    return list
  }, [groups, tab, search, currentUserId])

  const handleContextMenu = (e: React.MouseEvent, g: any) => {
    e.preventDefault()
    setContextMenu({ 
      groupId: g.id, 
      type: g.type,
      x: e.clientX, 
      y: e.clientY, 
      isPinned: g.isPinned, 
      isArchived: g.isArchived, 
      isMuted: g.isMuted,
      isOwner: g.members?.find((m: any) => m.userId === currentUserId)?.role === 'OWNER' || g.adminId === currentUserId
    })
  }

  return (
    <>
      {showNewGroup && <NewGroupModal users={availableUsers} categories={categories} currentUserId={currentUserId} onClose={() => setShowNewGroup(false)} />}
      {showNewDM && <NewDMModal users={availableUsers} currentUserId={currentUserId} onClose={() => setShowNewDM(false)} />}
      {contextMenu && (
        <div className="fixed inset-0 z-[200]" onClick={() => setContextMenu(null)}>
          <div className="absolute" style={{ left: contextMenu.x, top: contextMenu.y }}>
            <ConvMenu 
              groupId={contextMenu.groupId} 
              type={contextMenu.type}
              isPinned={contextMenu.isPinned}
              isArchived={contextMenu.isArchived}
              isMuted={contextMenu.isMuted}
              isOwner={contextMenu.isOwner}
              onClose={() => setContextMenu(null)} 
            />
          </div>
        </div>
      )}

      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="bg-[#F0F2F5] px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {currentUser?.image
              ? <img src={currentUser.image} alt="me" className="w-10 h-10 rounded-full object-cover cursor-pointer" />
              : <div className="w-10 h-10 rounded-full bg-[#5A2D82] flex items-center justify-center text-white font-bold">{currentUser?.name?.charAt(0)}</div>
            }
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowNewDM(true)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600" title="New message">
              <MessageSquare size={20} />
            </button>
            <button onClick={() => setShowNewGroup(true)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600" title="New group">
              <Users size={20} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-[#F0F2F5] rounded-full px-4 py-2">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input placeholder="Search or start new chat" value={search} onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent text-sm outline-none text-gray-700" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-gray-100 shrink-0">
          {tab as string === 'archived' ? (
            <button onClick={() => setTab('all')} className="flex items-center gap-2 px-3 py-1.5 text-[#5A2D82] font-bold text-xs hover:bg-[#5A2D82]/5 rounded-full transition-colors">
              <X size={14} /> Back to chats
            </button>
          ) : (
            <>
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread ${unreadTotal > 0 ? unreadTotal : ''}`.trim() },
                { id: 'groups', label: `Groups ${groupCount > 0 ? groupCount : ''}`.trim() },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={cn('shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                    tab === t.id ? 'bg-[#5A2D82]/10 text-[#5A2D82]' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >{t.label}</button>
              ))}
              <button className="shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"><Plus size={14} /></button>
            </>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {groups.some((g: any) => g.isArchived) && tab === 'all' && (
            <button onClick={() => setTab('archived' as any)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-[#5A2D82]">
              <Archive size={20} className="shrink-0" />
              <span className="text-[13px] font-semibold flex-1 text-left">Archived</span>
              <span className="text-xs font-bold bg-[#5A2D82]/10 px-2 py-0.5 rounded-full">{groups.filter((g: any) => g.isArchived).length}</span>
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <MessageSquare size={40} className="text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No conversations</p>
              <button onClick={() => setShowNewDM(true)} className="mt-4 text-xs text-[#5A2D82] font-bold hover:underline">Start a new chat</button>
            </div>
          ) : filtered.map((g: any) => {
            const isActive = pathname === `/chat/${g.id}`
            const lastMsg = g.messages?.[0]
            const preview = lastMsg ? (lastMsg.type !== 'TEXT' ? `📎 ${lastMsg.fileName || lastMsg.type}` : lastMsg.content) : 'Tap to start chatting'
            const senderPrefix = lastMsg?.sender?.id === currentUserId ? 'You: ' : (g.type === 'GROUP' && lastMsg?.sender ? `${lastMsg.sender.name?.split(' ')[0]}: ` : '')

            return (
              <div key={g.id} className="relative">
                <Link href={`/chat/${g.id}`} onContextMenu={e => handleContextMenu(e, g)}
                  className={cn('flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-gray-50',
                    isActive ? 'bg-[#F0F2F5]' : 'hover:bg-[#F5F5F5]'
                  )}
                >
                  <ConvAvatar group={g} currentUserId={currentUserId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          <ConvName group={g} currentUserId={currentUserId} />
                        </p>
                        {g.isMuted && <BellOff size={12} className="text-gray-300 shrink-0" />}
                      </div>
                      <span className={cn('text-[11px] shrink-0 ml-1', g.unreadCount > 0 ? 'text-[#5A2D82] font-semibold' : 'text-gray-400')}>
                        {lastMsg ? getTime(lastMsg.createdAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">
                        <span className="font-medium text-gray-500">{senderPrefix}</span>{preview}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0 ml-1">
                        {g.isPinned && <Pin size={14} className="text-gray-300 rotate-45" />}
                        {g.unreadCount > 0 && (
                          <span className="min-w-[20px] h-5 px-1.5 bg-[#5A2D82] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                            {g.unreadCount > 99 ? '99+' : g.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
