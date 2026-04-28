'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { 
  Pin, Megaphone, Search, Bell, Info, X, Send, 
  Trash2, PinOff, Calendar, User, ChevronRight,
  AlertCircle
} from 'lucide-react'
import ReactionBar from '@/components/ui/ReactionBar'
import CommentSection from '@/components/ui/CommentSection'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { createAnnouncement, deleteAnnouncement, togglePinAnnouncement } from '@/app/intranet/announcements/actions'
import { toast } from 'sonner'

export function AnnouncementsClient({ 
  announcements: initialAnnouncements, 
  userBranchName, 
  currentUserId,
  isAdmin,
  categories
}: { 
  announcements: any[], 
  userBranchName?: string, 
  currentUserId: string,
  isAdmin: boolean,
  categories: any[]
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  // User requested tab list
  const allTabs = [
    'All', 
    'General', 
    'Academic', 
    'Academic Operations', 
    'Operations', 
    'Event', 
    'HR'
  ]

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(a => {
      const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         a.content.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchSearch) return false
      
      if (activeTab === 'All') return true
      if (activeTab === 'General') {
        return a.targetCategories.length === 0
      }
      return a.targetCategories.some((c: any) => c.name === activeTab)
    })
  }, [announcements, activeTab, searchQuery])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success('Announcement deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    try {
      await togglePinAnnouncement(id, !currentStatus)
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !currentStatus } : a))
      toast.success(currentStatus ? 'Announcement unpinned' : 'Announcement pinned')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-4 md:p-8 md:pl-16 max-w-7xl mx-auto space-y-8">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            <span className="text-primary">Leeds</span> <span className="text-gold-leeds">News</span> <span className="text-black">Feed</span>
          </h1>
          <p className="text-sm text-gray-700 font-bold uppercase tracking-widest mt-2">School-wide community updates and official memos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search announcements..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:border-primary/20 focus:bg-white outline-none transition-all placeholder:text-gray-400"
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="shrink-0 bg-primary hover:bg-primary/95 text-white font-black py-3.5 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" /> + New
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        {allTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-primary text-white shadow-lg shadow-primary/30' 
              : 'bg-white text-gray-600 border border-gray-100 hover:border-primary/20 hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── FEED ── */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAnnouncements.length === 0 ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="bg-white p-20 rounded-[3rem] shadow-soft text-center border border-dashed border-gray-200"
             >
               <Bell className="w-16 h-16 mx-auto mb-6 text-gray-100" />
               <p className="text-xl font-black text-gray-900 uppercase tracking-tight">No Announcements Found</p>
               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mt-2">Try clearing your search or switching categories</p>
             </motion.div>
          ) : (
            filteredAnnouncements.map((a, index) => (
              <motion.div 
                key={a.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-white rounded-[2.5rem] p-8 md:p-10 shadow-soft hover:shadow-premium border border-gray-50 hover:border-primary/10 transition-all duration-500 relative overflow-hidden ${a.isPinned ? 'ring-2 ring-rose-500/10' : ''}`}
              >
                {/* Administrative Actions */}
                {isAdmin && (
                  <div className="absolute top-8 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleTogglePin(a.id, a.isPinned)}
                      className={`p-3 rounded-xl transition-all ${a.isPinned ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400 hover:text-rose-500'}`}
                      title={a.isPinned ? "Unpin" : "Pin"}
                    >
                      {a.isPinned ? <PinOff size={18} /> : <Pin size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(a.id)}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                  {/* Author Meta (Desktop Side) */}
                  <div className="hidden md:flex flex-col items-center w-24 space-y-3">
                    <UserAvatar imageUrl={a.author?.image} name={a.author?.name} size="lg" />
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-gray-900 line-clamp-1">{a.author?.name?.split(' ')[0]}</p>
                      <p className="text-[8px] font-bold text-gray-600 uppercase mt-0.5">{format(new Date(a.createdAt), "MMM dd")}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    {/* Tags & Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      {a.isPinned && (
                        <span className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-500/20">
                          <Pin className="w-3 h-3 fill-current" /> Pinned
                        </span>
                      )}
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        a.targetCategories?.length > 0 
                        ? 'bg-primary/5 text-primary border-primary/10' 
                        : 'bg-gold-leeds/10 text-gold-leeds border-gold-leeds/20'
                      }`}>
                        {a.targetCategories?.[0]?.name || 'General Announcement'}
                      </span>
                      {a.branch && (
                        <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                          {a.branch.name}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{a.title}</h2>
                      <p className="text-base text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">{a.content}</p>
                    </div>

                    {/* Engagement */}
                    <div className="pt-8 mt-8 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                       <div className="flex items-center gap-10">
                         <ReactionBar entityType="Announcement" entityId={a.id} initialReactions={a.summaryReactions} revalidatePath="/intranet/announcements" />
                         <CommentSection entityType="Announcement" entityId={a.id} currentUserId={currentUserId} initialComments={a.comments} revalidatePath="/intranet/announcements" />
                       </div>
                       
                       <div className="flex items-center gap-3 md:hidden">
                         <UserAvatar imageUrl={a.author?.image} name={a.author?.name} size="sm" />
                         <div>
                            <p className="text-[10px] font-black uppercase text-gray-900">{a.author?.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{format(new Date(a.createdAt), "MMM dd, yyyy")}</p>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── CREATE MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-premium overflow-hidden border border-white/50"
            >
              <form 
                onSubmit={async (e) => {
                  e.preventDefault()
                  setIsPending(true)
                  try {
                    const fd = new FormData(e.currentTarget)
                    await createAnnouncement(fd)
                    setIsModalOpen(false)
                    toast.success('Announcement published!')
                  } catch (err: any) {
                    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
                      setIsModalOpen(false)
                      return;
                    }
                    toast.error(err.message)
                  } finally {
                    setIsPending(false)
                  }
                }}
                className="p-10 md:p-14 space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                      <Megaphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">New Announcement</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Broadcast to the community</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-300 transition-colors">
                    <X className="w-7 h-7" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Memo Title</label>
                    <input 
                      name="title" 
                      required 
                      placeholder="e.g. End of Term Arrangements..."
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all placeholder:text-gray-300" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Category</label>
                      <select 
                        name="categoryIds" 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold outline-none transition-all"
                      >
                        <option value="">General (All Staff)</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pin to Top</label>
                      <div className="flex items-center gap-4 h-[56px] px-6 bg-gray-50 rounded-2xl border-2 border-transparent">
                        <input type="checkbox" name="isPinned" id="isPinned" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                        <label htmlFor="isPinned" className="text-xs font-black uppercase tracking-widest text-gray-600 cursor-pointer">Mark as Urgent</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Announcement Body</label>
                    <textarea 
                      name="content" 
                      required 
                      rows={6}
                      placeholder="Type your official message here..."
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/10 focus:bg-white rounded-[2rem] px-6 py-6 text-sm font-medium outline-none transition-all placeholder:text-gray-300 resize-none" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Cancel</button>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="flex-[2] py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:translate-y-[-2px] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isPending ? 'Publishing...' : <><Send className="w-4 h-4" /> Publish Announcement</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
