'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Map as MapIcon, Globe2, MapPin, 
  Map as MapUI, Layers, Navigation2, 
  Search, Plus, ChevronRight, Settings2,
  Maximize2, Box
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function GeoClustering({ branches }: { branches: any[] }) {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null)

  const CLUSTERS = [
    { id: 'western', name: 'Western Province', color: '#600180', count: 5, bg: 'bg-[#600180]/10', coords: { x: 30, y: 60 } },
    { id: 'southern', name: 'Southern Province', color: '#F5C431', count: 3, bg: 'bg-[#F5C431]/10', coords: { x: 45, y: 85 } },
    { id: 'central', name: 'Central Province', color: '#B1B1B1', count: 4, bg: 'bg-slate-100', coords: { x: 50, y: 50 } },
    { id: 'northern', name: 'Northern Province', color: '#334155', count: 2, bg: 'bg-slate-900', coords: { x: 40, y: 20 } },
  ]

  const provincePolygons = [
    { id: 'northern', d: "M 40,5 L 55,15 L 50,35 L 30,30 L 25,15 Z", color: '#1e293b' },
    { id: 'western', d: "M 20,50 L 35,55 L 30,75 L 15,70 Z", color: '#600181' },
    { id: 'central', d: "M 40,40 L 60,45 L 55,65 L 35,60 Z", color: '#B1B1B1' },
    { id: 'southern', d: "M 35,75 L 55,80 L 60,95 L 30,95 Z", color: '#F5C431' },
  ]

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      {/* ── LEFT: INTERACTIVE 2D MAP ── */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 overflow-hidden relative min-h-[700px]">
          <div className="absolute top-10 left-10 z-10 space-y-2">
            <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter decoration-[#600180] underline decoration-4 underline-offset-8">Geographic <span className="text-[#600180]">Clustering</span></h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">2D Sovereign Connectivity Canvas</p>
          </div>

          <div className="absolute top-10 right-10 z-10 flex items-center gap-3">
            <button className="w-12 h-12 rounded-2xl bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#600180] transition-all"><Search size={20} /></button>
            <button className="w-12 h-12 rounded-2xl bg-[#600180] shadow-xl shadow-[#600180]/20 flex items-center justify-center text-white hover:scale-105 transition-all"><Maximize2 size={20} /></button>
          </div>

          {/* ── SVG CANVAS ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] opacity-15">
              <path d="M 40,5 C 60,10 80,40 70,70 C 65,95 40,98 20,95 C 10,80 5,40 10,20 C 15,5 30,2 40,5" fill="none" stroke="#600180" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>

          <div className="relative w-full h-[600px] mt-10">
            {/* Symbolic Regions as interactive zones */}
            {CLUSTERS.map(cluster => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                onClick={() => setSelectedCluster(cluster.id)}
                style={{ 
                  left: `${cluster.coords.x}%`, 
                  top: `${cluster.coords.y}%`,
                  backgroundColor: cluster.id === selectedCluster ? '#600180' : 'white',
                  borderColor: cluster.id === selectedCluster ? '#F5C431' : '#e2e8f0'
                }}
                className={cn(
                  "absolute w-44 p-4 rounded-3xl border-4 shadow-2xl cursor-pointer transition-all",
                  cluster.id === selectedCluster ? "shadow-[#F5C431]/30" : "shadow-slate-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg",
                    cluster.id === selectedCluster ? "bg-[#F5C431]" : "bg-[#600180]"
                  )}>
                    <Navigation2 size={16} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className={cn("text-[11px] font-black uppercase tracking-tight", cluster.id === selectedCluster ? "text-white" : "text-slate-900")}>
                      {cluster.name.split(' ')[0]}
                    </h4>
                    <p className={cn("text-[9px] font-bold uppercase", cluster.id === selectedCluster ? "text-white/60" : "text-slate-400")}>
                      {cluster.count} Units
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Connecting lines for the 'network' feel */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
               <motion.path 
                 d="M 35,65 L 50,55 M 50,55 L 45,30 M 50,55 L 55,85" 
                 stroke="#600180" 
                 strokeWidth="2" 
                 strokeDasharray="4,4" 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 className="opacity-20"
               />
            </svg>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-10 left-10 flex items-center gap-6 bg-slate-50/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-100">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#600180]" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Master Cluster</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#F5C431]" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Selected Region</span>
             </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: CLUSTER DETAILS ── */}
      <div className="xl:col-span-4 space-y-6">
        <div className="bg-slate-950 rounded-[3rem] border border-slate-900 shadow-2xl p-10 relative overflow-hidden h-full flex flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,196,49,0.1),transparent)]" />
          
          <div className="relative mb-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5C431] mb-2">Regional Insights</h4>
            <h2 className="text-3xl font-black text-white italic tracking-tighter">Cluster <span className="text-purple-400">Governance</span></h2>
          </div>

          <div className="flex-1 space-y-6">
             {selectedCluster ? (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{CLUSTERS.find(c => c.id === selectedCluster)?.name}</h3>
                       <div className="w-10 h-10 rounded-xl bg-[#600180] flex items-center justify-center text-white"><Box size={18} /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Avg Authority</p>
                         <p className="text-[13px] font-black text-[#F5C431]">82.4%</p>
                       </div>
                       <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Compliance</p>
                         <p className="text-[13px] font-black text-emerald-400">98%</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 underline decoration-white/10 decoration-2 underline-offset-4">Branches in Cluster</p>
                       {branches.slice(0, 4).map(b => (
                         <div key={b.id} className="flex items-center justify-between group cursor-pointer p-1">
                           <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-[#F5C431] group-hover:scale-125 transition-all" />
                             <span className="text-[11px] font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-tight">{b.name}</span>
                           </div>
                           <ChevronRight size={14} className="text-white/20 group-hover:text-[#F5C431] transition-all" />
                         </div>
                       ))}
                    </div>
                  </div>
               </motion.div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                 <div className="w-20 h-20 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white/20 border border-white/5">
                   <Navigation2 size={32} />
                 </div>
                 <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] leading-relaxed italic">Select a regional cluster on the canvas to inspect governance telemetry.</p>
               </div>
             )}
          </div>

          <div className="relative mt-10">
            <button className="w-full py-5 bg-[#600180] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-[#600180]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
              <Plus size={16} /> New Cluster Zone
            </button>
            <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mt-6">Sovereign Cluster Engine v4.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
