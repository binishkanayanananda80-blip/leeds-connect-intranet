'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Eye, Edit3, CheckCircle2, Share2, ShieldCheck, ChevronRight, Layers } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function PermissionMatrix({ branches }: { branches: any[] }) {
  const [selectedCell, setSelectedCell] = useState<{ source: string, target: string } | null>(null)
  const [permissions, setPermissions] = useState<Record<string, Record<string, string[]>>>({})

  const PERMISSION_TYPES = [
    { id: 'view', label: 'View Data', icon: Eye, color: 'text-blue-500' },
    { id: 'edit', label: 'Edit Data', icon: Edit3, color: 'text-amber-500' },
    { id: 'approve', label: 'Approve Req', icon: CheckCircle2, color: 'text-emerald-500' },
    { id: 'share', label: 'Share Res', icon: Share2, color: 'text-purple-500' },
  ]

  const togglePermission = (source: string, target: string, type: string) => {
    setPermissions(prev => {
      const sourceMap = prev[source] || {}
      const targetList = sourceMap[target] || []
      
      const newList = targetList.includes(type)
        ? targetList.filter(t => t !== type)
        : [...targetList, type]

      return {
        ...prev,
        [source]: {
          ...sourceMap,
          [target]: newList
        }
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-900 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,1,128,0.2),transparent)]" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tight">
              Permission <span className="text-[#600180]">Matrix</span>
            </h3>
            <p className="text-white/40 text-xs font-bold leading-relaxed max-w-xl uppercase tracking-widest">
              Master control grid for inter-branch data flow. Define which units can view, edit, or approve requests from peer organizational structures.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-4">
               <div className="flex -space-x-3">
                 {branches.slice(0, 3).map((b, i) => (
                   <div key={b.id} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black text-white">
                     {b.name[0]}
                   </div>
                 ))}
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-[#F5C431]">
                 {branches.length} Governance Units
               </p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-inner p-8 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-left bg-slate-50 rounded-2xl min-w-[200px]">
                  Master Branch (Source)
                </th>
                {branches.map(b => (
                  <th key={b.id} className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-center bg-slate-50/50 rounded-2xl min-w-[150px]">
                    {b.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.map(source => (
                <tr key={source.id}>
                  <td className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#600180] text-white flex items-center justify-center text-[10px] font-black">
                        {source.name[0]}
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{source.name}</span>
                    </div>
                  </td>
                  {branches.map(target => {
                    const isSelf = source.id === target.id
                    const currentPerms = permissions[source.id]?.[target.id] || []
                    const permCount = currentPerms.length

                    return (
                      <td key={target.id} className="p-1">
                        <button
                          disabled={isSelf}
                          onClick={() => setSelectedCell({ source: source.id, target: target.id })}
                          className={cn(
                            "w-full h-16 rounded-2xl transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden",
                            isSelf ? "bg-slate-100/50 cursor-not-allowed" : 
                            permCount > 0 ? "bg-[#600180]/5 border-2 border-[#600180]/30" : "bg-slate-50 border border-transparent hover:border-slate-200"
                          )}
                        >
                          {isSelf ? (
                            <div className="w-2 h-2 rounded-full bg-slate-300" />
                          ) : (
                            <>
                              <div className="flex gap-0.5">
                                {PERMISSION_TYPES.map(p => (
                                  <div 
                                    key={p.id} 
                                    className={cn(
                                      "w-1.5 h-1.5 rounded-full transition-all scale-0 group-hover:scale-100",
                                      currentPerms.includes(p.id) ? "bg-[#600180] scale-100" : "bg-slate-200"
                                    )} 
                                  />
                                ))}
                              </div>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-tighter",
                                permCount > 0 ? "text-[#600180]" : "text-slate-400"
                              )}>
                                {permCount > 0 ? `${permCount} Active` : 'Sovereign'}
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PERMISSION EDITOR MODAL ── */}
      <AnimatePresence>
        {selectedCell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCell(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#600180] via-[#F5C431] to-[#600180]" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#600180]/5 flex items-center justify-center text-[#600180] border border-[#600180]/10 shadow-inner">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Permission <span className="text-[#600180]">Control</span></h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F5C431] mt-1">
                      <span>{branches.find(b => b.id === selectedCell.source)?.name.split(' ')[0]}</span>
                      <ChevronRight size={12} className="text-slate-300" />
                      <span className="text-[#600180]">{branches.find(b => b.id === selectedCell.target)?.name.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedCell(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {PERMISSION_TYPES.map(item => {
                  const isActive = (permissions[selectedCell.source]?.[selectedCell.target] || []).includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => togglePermission(selectedCell.source, selectedCell.target, item.id)}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 text-left group",
                        isActive ? "bg-[#600180]/5 border-[#600180] shadow-xl" : "bg-slate-50 border-transparent hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        isActive ? "bg-[#600180] text-white" : "bg-white text-slate-300 shadow-inner group-hover:bg-white/80"
                      )}>
                        <item.icon size={22} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isActive ? "text-[#600180]" : "text-slate-400")}>{item.label}</p>
                        <p className="text-[10px] font-bold text-slate-400/60 leading-tight">Master Authority Override</p>
                      </div>
                      <div className={cn(
                        "w-11 h-6 rounded-full relative transition-all",
                        isActive ? "bg-[#600180]" : "bg-slate-200"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          isActive ? "right-1" : "left-1"
                        )} />
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Governance Rule Sync Active</p>
                </div>
                <button 
                  onClick={() => setSelectedCell(null)}
                  className="px-10 py-4 bg-[#600180] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#600180]/30 hover:scale-105 transition-all"
                >
                  Save Authority Set
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
