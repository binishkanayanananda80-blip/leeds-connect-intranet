'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, Users, LayoutDashboard, Search, 
  Settings, CheckSquare, X, ArrowLeft, ArrowRight,
  UserPlus, UserMinus, Building, Filter,
  MoreVertical, ShieldCheck, Mail, Phone
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { importStudents, rejectStudents } from '@/app/admin/school/actions'

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'pending', label: 'Pending Import', icon: UserPlus },
  { id: 'registry', label: 'Student Registry', icon: GraduationCap },
  { id: 'settings', label: 'Hub Settings', icon: Settings },
]

export default function SchoolAdminClient({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12 pb-40">
      
      {/* ── BREADCRUMBS ── */}
      <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <Link href="/admin" className="hover:text-primary transition-colors">Elite Command</Link>
        <ArrowRight size={12} className="opacity-40" />
        <span className="text-slate-800">Functional Hubs</span>
        <ArrowRight size={12} className="opacity-40" />
        <span className="text-amber-600">School Governance Hub</span>
      </nav>

      {/* ── MASTER HEADER ── */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 shadow-2xl p-12 md:p-16 border border-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent)]" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 rounded-3xl bg-amber-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center text-white">
            <GraduationCap size={44} />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
              School <span className="text-amber-500">Master Hub</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl">
              The primary governance center for learner lifecycle management, academic records, and student citizenry.
            </p>
          </div>
          <div className="md:ml-auto flex gap-4">
             <div className="bg-white/5 border border-white/10 backdrop-blur-md px-8 py-5 rounded-3xl text-center">
                <p className="text-3xl font-black text-amber-500 leading-none mb-1">{data.activeStudents.length}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Learners</p>
             </div>
             <div className="bg-amber-500/10 border border-amber-500/20 backdrop-blur-md px-8 py-5 rounded-3xl text-center">
                <p className="text-3xl font-black text-amber-400 leading-none mb-1">{data.pendingStudents.length}</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Pending Import</p>
             </div>
          </div>
        </div>
      </motion.header>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex flex-wrap items-center gap-3 p-2 bg-white rounded-3xl border border-slate-100 shadow-sm w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT AREA ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
        >
          {activeTab === 'dashboard' && <DashboardView data={data} />}
          {activeTab === 'pending' && <PendingView students={data.pendingStudents} />}
          {activeTab === 'registry' && <RegistryView students={data.activeStudents} />}
          {activeTab === 'settings' && <SettingsView />}
        </motion.div>
      </AnimatePresence>

    </div>
  )
}

function DashboardView({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
             <GraduationCap size={150} />
          </div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">Functional Status</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl mb-10">
            Current learner intake is healthy. All student records are being properly mapped to their respective branches. Review the pending import queue to authorize new registrations.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sync Consistency</p>
                <p className="text-xl font-bold text-slate-800">99.2%</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Automated Rules</p>
                <p className="text-xl font-bold text-slate-800">Awaiting Config</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Notifications</p>
                <p className="text-xl font-bold text-slate-800">3 Alerts</p>
             </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="bg-amber-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-amber-600/20">
           <h3 className="text-xl font-black uppercase tracking-tight mb-2">Modular Handoff</h3>
           <p className="text-white/70 text-xs font-medium leading-relaxed mb-6">Review the learner imports to ensure all registration requirements are met before allowing system access.</p>
           <Link href="#" onClick={(e) => { e.preventDefault(); /* Logic to switch tab */ }}>
             <button className="w-full py-4 bg-white text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-50 transition-all flex items-center justify-center gap-3">
               Go to Queue <ArrowRight size={14} />
             </button>
           </Link>
        </div>
      </div>
    </div>
  )
}

function PendingView({ students }: { students: any[] }) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const handleImport = async (ids: string[]) => {
    setLoading(true)
    try {
      await importStudents(ids)
      toast.success(`Successfully imported ${ids.length} student(s)`)
      setSelected([])
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (ids: string[]) => {
    if (!confirm('Are you sure you want to reject these learner imports?')) return
    setLoading(true)
    try {
      await rejectStudents(ids)
      toast.success('Learner(s) rejected from hub')
      setSelected([])
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
           <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Pending Import Queue</h3>
           <p className="text-sm text-slate-400 font-medium">Moderate incoming learner registrations from the Entity Registry.</p>
        </div>
        <div className="flex items-center gap-3">
           {selected.length > 0 && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 pr-4 mr-4 border-r border-slate-100">
                <button 
                  onClick={() => handleReject(selected)}
                  className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                >
                  <UserMinus size={14} /> Reject Selective
                </button>
                <button 
                  onClick={() => handleImport(selected)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                >
                  <UserPlus size={14} /> Import Selected ({selected.length})
                </button>
             </motion.div>
           )}
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search learner..." className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 outline-none w-[300px]" />
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
           <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                 <th className="px-6 py-5 w-10">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 rounded border-slate-200"
                     checked={selected.length === students.length && students.length > 0}
                     onChange={(e) => setSelected(e.target.checked ? students.map(s => s.id) : [])}
                   />
                 </th>
                 <th className="px-6 py-5">Student Identity</th>
                 <th className="px-6 py-5">Entity ID</th>
                 <th className="px-6 py-5">Assigned Branch</th>
                 <th className="px-6 py-5 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {students.map(student => (
                <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-6 py-5">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-200"
                      checked={selected.includes(student.id)}
                      onChange={() => setSelected(prev => prev.includes(student.id) ? prev.filter(x => x !== student.id) : [...prev, student.id])}
                    />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center">
                          {student.image ? <img src={student.image} className="w-full h-full object-cover" /> : <Users size={18} className="text-slate-400" />}
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Basic Profile Verified</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                     <span className="text-[10px] font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-500 font-black">{student.entityId}</span>
                  </td>
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <Building size={14} className="text-slate-300" /> {student.branch?.name || 'Network Central'}
                     </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleReject([student.id])}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <X size={16} />
                        </button>
                        <button 
                          onClick={() => handleImport([student.id])}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                        >
                          Quick Import
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                       <GraduationCap size={64} />
                       <div>
                          <p className="text-xl font-black text-slate-900 uppercase">Registry is Idle</p>
                          <p className="text-xs font-bold text-slate-400 tracking-widest">No pending learner imports for this institutional context.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
           </tbody>
        </table>
      </div>
    </div>
  )
}

function RegistryView({ students }: { students: any[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm space-y-8">
       <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Active Learner Registry</h3>
             <p className="text-sm text-slate-400 font-medium">Historical and current active student records linked to the School Hub.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all">
             <Filter size={16} /> Sort & Filter
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map(student => (
            <div key={student.id} className="bg-slate-50/50 border border-slate-100 p-6 rounded-[2.5rem] group hover:bg-white hover:shadow-xl hover:border-primary/10 transition-all duration-500">
               <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm overflow-hidden flex items-center justify-center border border-slate-100">
                     {student.image ? <img src={student.image} className="w-full h-full object-cover" /> : <GraduationCap size={24} className="text-slate-300" />}
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                     <MoreVertical size={18} />
                  </button>
               </div>
               <div className="space-y-1 mb-8">
                  <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight">{student.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{student.studentProfile?.studentId || student.entityId}</p>
               </div>
               <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Active Learner</div>
                  <div className="text-[9px] font-black text-slate-300 uppercase ml-auto">Branch {student.branch?.name?.split(' ')[0]}</div>
               </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 grayscale">
               <GraduationCap size={64} className="mx-auto mb-4" />
               <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">No students in the registry</p>
            </div>
          )}
       </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="max-w-4xl space-y-10">
       <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm space-y-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <ShieldCheck size={120} />
          </div>
          <div className="space-y-2">
             <h3 className="text-3xl font-black text-slate-800 tracking-tight">Governance Policies</h3>
             <p className="text-slate-400 font-medium">Configure institutional behavior for student profile management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Automatic Approval</p>
                   <div className="w-10 h-6 bg-slate-100 rounded-full cursor-not-allowed" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">If enabled, entities created in the registry will bypass the import queue. Currently disabled for security compliance.</p>
             </div>
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Modular Sync</p>
                   <div className="w-10 h-6 bg-amber-500 rounded-full" />
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">Automatically re-sync student records with the LMS and Academic portals upon update.</p>
             </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex justify-end">
             <button disabled className="px-10 py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl opacity-50 cursor-not-allowed">
                Save Global Config
             </button>
          </div>
       </div>
    </div>
  )
}
