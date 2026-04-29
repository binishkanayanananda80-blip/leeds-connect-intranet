'use client'

import { useState } from 'react'
import { X, UserPlus, LogOut, Trash2, Camera, Info, Image as ImageIcon, FileText, Pin, ChevronRight, Search } from 'lucide-react'
import { addGroupMember, removeGroupMember, updateGroupInfo, deleteChatGroup, toggleAdminRole } from '@/app/chat/actions'

interface GroupInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  group: any
  currentUserId: string
  availableUsers: any[]
}

export function GroupInfoPanel({ isOpen, onClose, group, currentUserId, availableUsers }: GroupInfoPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(group.name || '')
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [editedDesc, setEditedDesc] = useState(group.description || '')
  const [isUploadingIcon, setIsUploadingIcon] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const isGroup = group.type === 'GROUP'
  const members = group.members || []
  const myMembership = members.find((m: any) => m.userId === currentUserId)
  
  const isOwner = myMembership?.role === 'OWNER' || group.adminId === currentUserId // Fallback to adminId if role is missing
  const isAdmin = isOwner || myMembership?.role === 'ADMIN'

  const filteredUsers = availableUsers.filter(u => 
    !members.some((m: any) => m.userId === u.id) &&
    u.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddMember = async (userId: string) => {
    await addGroupMember(group.id, userId)
  }

  const handleRemoveMember = async (userId: string) => {
    if (confirm('Remove this member?')) {
      await removeGroupMember(group.id, userId)
    }
  }

  const handleExitGroup = async () => {
    if (confirm('Are you sure you want to exit this group?')) {
      await removeGroupMember(group.id, currentUserId)
      onClose()
    }
  }

  const handleDeleteGroup = async () => {
    if (confirm('Are you sure you want to delete this group? This action is permanent.')) {
      await deleteChatGroup(group.id)
      onClose()
    }
  }

  const handleIconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingIcon(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/chat/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        await updateGroupInfo(group.id, { iconUrl: data.url })
      }
    } catch (err) {
      alert('Failed to upload icon')
    } finally {
      setIsUploadingIcon(false)
    }
  }

  const handleSaveDesc = async () => {
    await updateGroupInfo(group.id, { description: editedDesc })
    setIsEditingDesc(false)
  }

  const handleSaveName = async () => {
    if (!editedName.trim()) return
    await updateGroupInfo(group.id, { name: editedName })
    setIsEditingName(false)
  }

  return (
    <div className={`absolute inset-y-0 right-0 w-full md:w-80 lg:w-96 bg-white z-[150] shadow-2xl flex flex-col transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4 bg-[#F0F2F5] shrink-0">
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full">
          <X className="w-6 h-6 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800">Group info</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group Profile */}
        <div className="p-8 flex flex-col items-center bg-white border-b shadow-sm">
          <div className="relative group mb-4">
            <div className="w-40 h-40 rounded-full bg-[#5A2D82] flex items-center justify-center text-white text-6xl font-black overflow-hidden shadow-xl border-4 border-white">
              {isUploadingIcon ? (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : group.iconUrl ? (
                <img src={group.iconUrl} alt={group.name} className="w-full h-full object-cover" />
              ) : (
                (group.name || '?').charAt(0).toUpperCase()
              )}
            </div>
            {isAdmin && (
              <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-black tracking-widest gap-2 cursor-pointer">
                <Camera className="w-8 h-8" />
                CHANGE ICON
                <input type="file" className="hidden" accept="image/*" onChange={handleIconChange} />
              </label>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  autoFocus
                  className="text-xl font-bold text-gray-900 border-b-2 border-primary outline-none bg-transparent text-center"
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                />
                <button onClick={handleSaveName} className="text-xs text-[#C9A227] font-black uppercase">OK</button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
                {isAdmin && <button onClick={() => setIsEditingName(true)} className="p-1 hover:bg-gray-100 rounded-full"><FileText size={14} className="text-gray-400" /></button>}
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">Group · {members.length} participants</p>
        </div>

        {/* Description */}
        <div className="p-5 bg-white mb-3 border-b border-t shadow-sm">
          <div className="flex items-center justify-between mb-3">
             <span className="text-[13px] font-bold text-[#5A2D82] uppercase tracking-widest">Description</span>
             {isAdmin && (
               isEditingDesc ? (
                 <button onClick={handleSaveDesc} className="text-xs text-[#C9A227] font-black uppercase tracking-widest">Save</button>
               ) : (
                 <button onClick={() => setIsEditingDesc(true)} className="text-xs text-primary font-bold">Edit</button>
               )
             )}
          </div>
          {isEditingDesc ? (
            <textarea 
              autoFocus
              className="w-full text-sm text-gray-700 border rounded-lg p-2 focus:ring-1 focus:ring-primary outline-none"
              value={editedDesc}
              onChange={e => setEditedDesc(e.target.value)}
              rows={3}
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {group.description || 'Add a group description...'}
            </p>
          )}
        </div>

        {/* Media & Files */}
        <div className="p-5 bg-white mb-3 border-b shadow-sm hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-primary" />
              <span className="text-sm font-medium text-gray-700">Media, links and docs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">12</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </div>
        </div>

        {/* Participants */}
        <div className="p-5 bg-white shadow-sm border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-bold text-[#5A2D82] uppercase tracking-widest">
              {members.length} participants
            </span>
            {isAdmin && (
              <button 
                onClick={() => setShowAddMember(true)}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
              >
                <UserPlus size={16} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {members.map((m: any) => (
              <div key={m.userId} className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-gray-500 font-bold">
                  {m.user?.image ? (
                    <img src={m.user.image} alt={m.user.name} className="w-full h-full object-cover" />
                  ) : (
                    m.user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.user?.name}</p>
                    {m.role === 'OWNER' && (
                      <span className="text-[10px] bg-gold-leeds/10 text-gold-leeds px-1.5 py-0.5 rounded-md font-bold uppercase">Owner</span>
                    )}
                    {m.role === 'ADMIN' && (
                      <span className="text-[10px] bg-[#5A2D82]/10 text-[#5A2D82] px-1.5 py-0.5 rounded-md font-bold uppercase">Admin</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{m.user?.designation || 'Staff Member'}</p>
                </div>
                {isOwner && m.userId !== currentUserId && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => toggleAdminRole(group.id, m.userId)}
                      title={m.role === 'ADMIN' ? 'Dismiss as admin' : 'Make group admin'}
                      className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${m.role === 'ADMIN' ? 'text-[#5A2D82]' : 'text-gray-400'}`}
                    >
                      <Pin size={14} className={m.role === 'ADMIN' ? 'fill-current' : ''} />
                    </button>
                    <button 
                      onClick={() => handleRemoveMember(m.userId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                {!isOwner && isAdmin && m.userId !== currentUserId && m.role === 'MEMBER' && (
                  <button 
                    onClick={() => handleRemoveMember(m.userId)}
                    className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-5 bg-white mt-8 mb-20 space-y-4">
          <button 
            onClick={handleExitGroup}
            className="w-full flex items-center gap-4 text-red-500 font-bold text-sm p-4 hover:bg-red-50 rounded-2xl transition-colors"
          >
            <LogOut size={20} />
            Exit Group
          </button>
          {isOwner && (
            <button 
              onClick={handleDeleteGroup}
              className="w-full flex items-center gap-4 text-red-500 font-bold text-sm p-4 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <Trash2 size={20} />
              Delete Group
            </button>
          )}
        </div>
      </div>

      {/* Add Member Overlay */}
      {showAddMember && (
        <div className="absolute inset-0 bg-white z-[200] flex flex-col">
          <div className="p-4 border-b flex items-center gap-4 bg-[#F0F2F5]">
            <button onClick={() => setShowAddMember(false)} className="p-1 hover:bg-gray-200 rounded-full">
              <X className="w-6 h-6 text-gray-600" />
            </button>
            <h3 className="font-bold text-gray-800">Add participant</h3>
          </div>
          <div className="p-3">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 border">
              <Search size={14} className="text-gray-400" />
              <input 
                autoFocus
                placeholder="Search name..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((u: any) => (
              <button 
                key={u.id}
                onClick={() => handleAddMember(u.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#5A2D82]/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                   {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.designation || 'Staff'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
