'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Calendar, User, Trophy, Trash2, Sparkles, Filter, Briefcase, Search, Check, ChevronsUpDown } from 'lucide-react'
import { format } from 'date-fns'
import { createCelebration, deleteCelebration } from '@/app/intranet/celebrations/actions'
import { UserAvatar } from '@/components/ui/UserAvatar'

interface Celebration {
  id: string
  type: string
  title: string
  message: string | null
  staffName: string | null
  staffRole: string | null
  publishDate: Date | null
  user?: { image: string | null }
}

interface Employee {
  id: string
  name: string
  role: string
}

export default function CelebrationsClient({ 
  initialCelebrations,
  isAdmin,
  employees = []
}: { 
  initialCelebrations: Celebration[],
  isAdmin: boolean,
  employees?: Employee[]
}) {
  const [activeTab, setActiveTab] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Searchable Staff State
  const [staffSearch, setStaffSearch] = useState('')
  const [staffRole, setStaffRole] = useState('')
  const [showStaffDropdown, setShowStaffDropdown] = useState(false)
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const tabs = ['ALL', 'WORK ANNIVERSARY', 'PROMOTION', 'ACHIEVEMENT', 'AWARD', 'RETIREMENT', 'NEW HIRE']

  const filtered = activeTab === 'ALL' 
    ? initialCelebrations 
    : initialCelebrations.filter(c => c.type.toUpperCase() === activeTab)

  const handleStaffSearch = (query: string) => {
    setStaffSearch(query)
    setSelectedUserId(null) // Clear ID if user types a custom name
    if (query.length > 0) {
      const matches = employees.filter(e => 
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredEmployees(matches.slice(0, 10)) // Show top 10 matches
      setShowStaffDropdown(true)
    } else {
      setShowStaffDropdown(false)
    }
  }

  const selectEmployee = (emp: Employee) => {
    setStaffSearch(emp.name)
    setStaffRole(emp.role)
    setSelectedUserId(emp.id)
    setShowStaffDropdown(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const res = await createCelebration(formData)
      if (res?.success) {
        setIsModalOpen(false)
        setStaffSearch('')
        setStaffRole('')
        setSelectedUserId(null)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to add celebration')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this celebration?')) return
    try {
      await deleteCelebration(id)
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  return (
    <div className="space-y-10 animate-fade-in-up pb-20">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            <span className="text-primary">Celebrations</span> <span className="text-gold-leeds">&</span> <span className="text-black">Milestones</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2">Honouring the achievements of our staff</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => {
              setIsModalOpen(true)
              setStaffSearch('')
              setStaffRole('')
              setSelectedUserId(null)
            }}
            className="px-8 py-4 bg-primary text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-premium hover:shadow-primary-premium transition-all flex items-center gap-3 hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" /> Celebrate
          </button>
        )}
      </div>

      {/* ── TABS/FILTERS ── */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-2 px-2">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeTab === tab 
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
              : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20 hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── MILESTONE GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-white rounded-[3rem] shadow-soft border border-dashed border-gray-200"
            >
              <Trophy className="w-16 h-16 mx-auto mb-6 text-gray-100" />
              <p className="text-xl font-black text-gray-900 uppercase tracking-tight">No milestones yet</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2">New achievements will appear here</p>
            </motion.div>
          ) : (
            filtered.map((c, i) => (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[3rem] p-8 md:p-10 shadow-premium border border-gray-50 hover:border-primary/10 transition-all group relative overflow-hidden"
              >
                {/* Admin Delete Action */}
                {isAdmin && (
                  <button 
                    onClick={() => handleDelete(c.id)}
                    className="absolute top-8 right-8 p-3 bg-gray-50 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                )}

                {/* Card Layout matching UI */}
                <div className="flex flex-col h-full">
                  <div className="flex items-start gap-6 mb-6">
                    <UserAvatar 
                      imageUrl={c.user?.image} 
                      name={c.staffName || 'Team Member'} 
                      size="xl" 
                      className="shrink-0 ring-[6px] ring-gray-800" 
                      gradient={c.type === 'PROMOTION' ? 'from-indigo-500 to-purple-600' : c.type === 'AWARD' ? 'from-yellow-400 to-orange-500' : 'from-primary to-purple-800'}
                    />
                    
                    <div className="flex-1 space-y-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/10">
                          {c.type}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">
                        {c.title}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        {c.staffName} <span className="mx-1 text-gray-200">|</span> {c.staffRole || 'Team Member'}
                      </p>
                    </div>
                  </div>

                  {c.message && (
                    <div className="flex-1">
                       <p className="text-sm text-gray-500 leading-relaxed italic opacity-80 line-clamp-3">
                        &quot;{c.message}&quot;
                      </p>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      <Calendar size={14} className="text-primary/40" />
                      {c.publishDate ? format(new Date(c.publishDate), 'dd MMMM yyyy') : 'Recently'}
                    </div>
                    <div className="p-2 bg-primary/5 rounded-lg">
                       <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false)
                setShowStaffDropdown(false)
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Post Celebration</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mt-1">Honour a colleague&apos;s achievement</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-full transition-colors group">
                    <X size={24} className="text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <input type="hidden" name="userId" value={selectedUserId || ''} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Searchable Staff Name */}
                    <div className="space-y-3 relative">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Staff Name *</label>
                      <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          name="staffName" required
                          value={staffSearch}
                          onChange={(e) => handleStaffSearch(e.target.value)}
                          onFocus={() => { if (staffSearch) setShowStaffDropdown(true) }}
                          className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                          placeholder="Type or select name..."
                          autoComplete="off"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowStaffDropdown(!showStaffDropdown)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ChevronsUpDown size={14} className="text-gray-300" />
                        </button>
                      </div>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {showStaffDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto"
                          >
                            {filteredEmployees.length > 0 ? filteredEmployees.map(emp => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => selectEmployee(emp)}
                                className="w-full px-5 py-4 text-left hover:bg-primary/5 flex items-center justify-between group transition-colors"
                              >
                                <div>
                                  <p className="text-sm font-black text-gray-900">{emp.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase">{emp.role}</p>
                                </div>
                                {staffSearch === emp.name && <Check size={14} className="text-primary" />}
                              </button>
                            )) : (
                              <div className="px-5 py-4 text-xs font-bold text-gray-400 uppercase italic">
                                No match found. Enter custom name.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Current Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          name="staffRole"
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value)}
                          className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                          placeholder="Auto-filled or manual..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Milestone Type *</label>
                      <div className="relative">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <select 
                          name="type" required
                          className="w-full pl-12 pr-10 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="Achievement">Achievement</option>
                          <option value="Work Anniversary">Work Anniversary</option>
                          <option value="Promotion">Promotion</option>
                          <option value="Award">Award</option>
                          <option value="Retirement">Retirement</option>
                          <option value="New Hire">New Hire</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Occasion Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                        <input 
                          type="date" name="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          className="w-full pl-12 pr-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Headline / Title *</label>
                    <input 
                      name="title" required
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                      placeholder="e.g. Promoted to Senior Technician"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">Additional Details / Citation</label>
                    <textarea 
                      name="description" rows={3}
                      className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all resize-none"
                      placeholder="Share more about this incredible achievement..."
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      type="button" onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-8 py-5 border border-gray-100 text-gray-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" disabled={isSubmitting}
                      className="flex-1 px-8 py-5 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? 'Posting...' : <>Post Milestone <Sparkles className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
