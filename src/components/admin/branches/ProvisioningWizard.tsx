'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { 
  Plus, Settings, UserPlus, Zap, CheckCircle2, 
  ChevronRight, ChevronLeft, Building2, ShieldCheck, 
  Globe2, Lock, LayoutDashboard, Crown, Sparkles,
  Search, X, User as UserIcon
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ProvisioningWizard({ heads, modules, onComplete }: { heads: any[], modules: any[], onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const [isFinishing, setIsFinishing] = useState(false)
  
  // Selection State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHeadId, setSelectedHeadId] = useState<string | null>(null)
  const [activeModules, setActiveModules] = useState<string[]>([])

  const STEPS = [
    { id: 1, title: 'Identity', desc: 'Core Info', icon: Building2 },
    { id: 2, title: 'Admins', desc: 'Sovereign Roles', icon: Crown },
    { id: 3, title: 'Modules', desc: 'Functional Activation', icon: Zap },
    { id: 4, title: 'Governance', desc: 'Policy Enforce', icon: ShieldCheck },
  ]

  const filteredHeads = useMemo(() => {
    if (!searchQuery) return []
    return heads?.filter(h => 
      (h.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5) || []
  }, [heads, searchQuery])

  const selectedHead = heads?.find(h => h.id === selectedHeadId)

  const handleFinish = () => {
    setIsFinishing(true)
    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  const toggleModule = (slug: string) => {
    setActiveModules(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  return (
    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden min-h-[700px] flex flex-col">
      {/* ── PROGRESS HEADER ── */}
      <div className="bg-slate-950 p-10 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-[#600180] flex items-center justify-center text-white shadow-xl shadow-[#600180]/30 border border-white/10">
            <Sparkles size={30} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              Branch <span className="text-purple-400">Provisioning</span>
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">Automated Orchestration Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500",
                step === s.id ? "bg-[#F5C431] text-black scale-110 shadow-xl shadow-[#F5C431]/20" : 
                step > s.id ? "bg-emerald-500 text-white" : "bg-slate-900 text-white/20"
              )}>
                {step > s.id ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
              </div>
              <div className="hidden lg:block text-left">
                <p className={cn("text-[10px] font-black uppercase tracking-widest", step === s.id ? "text-white" : "text-white/20")}>{s.title}</p>
                <p className="text-[9px] font-bold text-white/10 uppercase italic">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="hidden lg:block w-8 h-px bg-white/5" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP CONTENT ── */}
      <div className="flex-1 p-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#600180]/5 rounded-bl-[20rem] -z-10 blur-3xl" />
        
        <AnimatePresence mode="wait">
          {!isFinishing ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 max-w-4xl"
            >
              {step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Define <span className="text-[#600180]">Branch Identity</span></h3>
                    <p className="text-slate-400 text-sm font-medium">Establish the core metadata and spatial parameters for the new operational unit.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#600180]">Branch Name</label>
                      <input type="text" placeholder="e.g., Kandy Regional Hub" className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-[#600180] transition-all text-sm font-black text-slate-900" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#600180]">Internal Code</label>
                      <input type="text" placeholder="LDS-KND-001" className="w-full bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-[#600180] transition-all text-sm font-black text-slate-900" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#600180]">Location Coordinates (Geo)</label>
                      <div className="flex gap-4">
                        <input type="text" placeholder="Latitude" className="flex-1 bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-[#600180] transition-all text-sm font-black text-slate-900" />
                        <input type="text" placeholder="Longitude" className="flex-1 bg-slate-50 p-5 rounded-2xl border-2 border-transparent focus:border-[#600180] transition-all text-sm font-black text-slate-900" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                   <div className="space-y-2">
                    <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Appoint <span className="text-[#630081]">Sovereign Head</span></h3>
                    <p className="text-slate-400 text-sm font-medium">Select the administrative leader who will hold absolute authority over this unit.</p>
                  </div>
                  
                  {selectedHead ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#600180]/5 border-2 border-[#600180] p-8 rounded-[2.5rem] flex items-center justify-between shadow-2xl shadow-[#600180]/10">
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 border-2 border-[#F5C431] overflow-hidden">
                          {selectedHead.image ? <img src={selectedHead.image} className="w-full h-full object-cover" alt="head" /> : <div className="w-full h-full flex items-center justify-center text-white font-black">{selectedHead.name?.[0]}</div>}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#600180] mb-1">Selected Sovereign Head</p>
                          <h4 className="text-2xl font-black text-slate-900 italic tracking-tight">{selectedHead.name || `${selectedHead.firstName} ${selectedHead.lastName}`}</h4>
                          <span className="inline-block mt-2 px-3 py-1 bg-[#F5C431] text-black text-[9px] font-black uppercase tracking-widest rounded-lg">{selectedHead.role?.name || 'ADMINISTRATOR'}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedHeadId(null)} className="p-4 bg-white border border-slate-100 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all shadow-lg active:scale-95">
                        <X size={20} />
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                        <input 
                          type="text" 
                          placeholder="Search for a leader by name..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 pl-16 pr-6 py-6 rounded-[2rem] border-2 border-transparent focus:border-[#600180] transition-all text-sm font-black text-slate-900 shadow-inner"
                        />
                      </div>

                      {searchQuery && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl divide-y divide-slate-50">
                          {filteredHeads.length > 0 ? filteredHeads.map(h => (
                            <button 
                              key={h.id} 
                              onClick={() => setSelectedHeadId(h.id)}
                              className="w-full p-6 flex items-center gap-5 hover:bg-slate-50 transition-all text-left group"
                            >
                              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black shadow-lg overflow-hidden shrink-0">
                                {h.image ? <img src={h.image} className="w-full h-full object-cover" alt="head" /> : h.name?.[0]}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-black text-slate-800 group-hover:text-[#600180] transition-colors">{h.name || `${h.firstName} ${h.lastName}`}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h.role?.name || 'MEMBER'}</p>
                              </div>
                              <div className="px-4 py-2 rounded-xl border border-slate-100 text-[9px] font-black uppercase text-slate-300 group-hover:bg-[#600180] group-hover:text-white group-hover:border-transparent transition-all">Select</div>
                            </button>
                          )) : (
                            <div className="p-10 text-center space-y-2 opacity-50 font-black italic text-slate-300">
                              <p>No candidates matching "{searchQuery}"</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-200 shadow-inner">
                          <UserPlus size={30} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-xs">Type a name above to search for qualified personnel from the institutional identity registry.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                   <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Module <span className="text-[#F5C431]">Activation</span></h3>
                      <span className="px-4 py-1.5 bg-slate-900 text-[#F5C431] text-[9px] font-black uppercase tracking-widest rounded-full border border-[#F5C431]/30">{activeModules.length} Functional Units Selected</span>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Select which functional system layers should be initialized for this branch from your institutional ERP catalog.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {modules.map(m => {
                      const Icon = (LucideIcons as any)[m.icon] || Zap
                      const isActive = activeModules.includes(m.slug)
                      return (
                        <div 
                          key={m.id} 
                          onClick={() => toggleModule(m.slug)}
                          className={cn(
                            "p-7 rounded-[2.5rem] bg-white border-2 transition-all flex flex-col gap-5 cursor-pointer group shadow-xl relative overflow-hidden",
                            isActive 
                              ? "border-[#600180] shadow-[#600180]/10 scale-[1.02]" 
                              : "border-slate-100 hover:border-slate-300 shadow-slate-200/50"
                          )}
                        >
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isActive ? "bg-[#600180] text-white shadow-lg" : "bg-slate-50 text-[#600180] group-hover:bg-[#600180] group-hover:text-white"
                          )}>
                            <Icon size={24} />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[13px] font-black uppercase tracking-tight text-slate-900 leading-none">{m.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 leading-tight line-clamp-2">{m.description || 'Institutional business vertical.'}</p>
                          </div>
                          {isActive && (
                            <div className="absolute top-4 right-4 text-[#F5C431]">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {modules.length === 0 && (
                    <div className="p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                      <Zap className="mx-auto text-slate-200" size={40} />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No modular business verticals discovered in the system.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                   <div className="space-y-2">
                    <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Policy <span className="text-emerald-500">Enforcement</span></h3>
                    <p className="text-slate-400 text-sm font-medium">Apply institutional governance rules and operational constraints.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-8 bg-slate-50 rounded-[2rem] flex items-center justify-between">
                       <div className="flex items-center gap-6">
                         <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#600180] shadow-lg"><Lock size={24} /></div>
                         <div>
                           <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Standard Data Sovereignty</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Branch data is restricted to local admins by default.</p>
                         </div>
                       </div>
                       <div className="w-14 h-8 bg-emerald-500 rounded-full relative p-1"><div className="absolute right-1 w-6 h-6 bg-white rounded-full" /></div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20">
               <div className="relative">
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="w-32 h-32 rounded-[3rem] border-4 border-dashed border-[#F5C431] opacity-20" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-20 h-20 rounded-[2rem] bg-[#600180] flex items-center justify-center text-white shadow-2xl shadow-[#600180]/50 animate-bounce">
                     <CheckCircle2 size={40} />
                   </div>
                 </div>
               </div>
               <div className="space-y-2">
                 <h3 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Provisioning <span className="text-[#600180]">Successful</span></h3>
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Master Governance set initialized · Branch Live</p>
               </div>
               <p className="text-[10px] text-slate-300 font-mono">NODE_SEQ_7739_ACTIVE</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── FOOTER ACTIONS ── */}
      {!isFinishing && (
        <div className="p-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              step === 1 ? "text-slate-300" : "text-slate-900 hover:bg-white hover:shadow-xl"
            )}
          >
            <ChevronLeft size={16} /> Previous
          </button>
          
          <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-white text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-slate-900 transition-all">
              Save Draft
            </button>
            {step < 4 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="px-10 py-4 bg-slate-950 text-white rounded-2xl shadow-xl shadow-black/10 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-3"
              >
                Next Step <ChevronRight size={16} className="text-[#F5C431]" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="px-12 py-5 bg-[#600180] text-white rounded-2xl shadow-2xl shadow-[#600180]/40 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 flex items-center gap-3"
              >
                Confirm & Initialize <Sparkles size={16} className="text-[#F5C431]" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
