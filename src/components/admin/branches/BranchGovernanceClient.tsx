'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Layers, Lock, ShieldAlert, Globe2, BarChart3, 
  Settings2, Plus, Zap, ChevronRight, LayoutDashboard,
  Map as MapIcon, Share2, Crown, Activity
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Shared utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { TopologyVisualizer } from './TopologyVisualizer'
import { PermissionMatrix } from './PermissionMatrix'
import { SovereigntyRules } from './SovereigntyRules'
import { GeoClustering } from './GeoClustering'
import { BranchHealthDashboard } from './BranchHealthDashboard'
import { ProvisioningWizard } from './ProvisioningWizard'

export type BranchTab = 'network' | 'permissions' | 'sovereignty' | 'clusters' | 'health' | 'provisioning'

export function BranchGovernanceClient({ initialBranches, initialHeads, initialModules }: { initialBranches: any[], initialHeads: any[], initialModules: any[] }) {
  const [activeTab, setActiveTab] = useState<BranchTab>('network')

  const TABS = [
    { id: 'network', label: 'Network Topology', icon: Layers, desc: 'Hierarchical Structure' },
    { id: 'permissions', label: 'Permission Matrix', icon: Lock, desc: 'Inter-Branch Access' },
    { id: 'sovereignty', label: 'Sovereignty Rules', icon: ShieldAlert, desc: 'Autonomy Controls' },
    { id: 'clusters', label: 'Geo Clusters', icon: MapIcon, desc: 'Regional Grouping' },
    { id: 'health', label: 'Health Monitor', icon: Activity, desc: 'KPI Analytics' },
  ]

  return (
    <div className="space-y-10">
      {/* ── HEADER ── */}
      <div className="relative rounded-[3rem] bg-slate-950 border border-slate-900 shadow-2xl overflow-hidden p-10 md:p-14 mb-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,196,49,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,1,128,0.3),transparent)]" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#600180] flex items-center justify-center shadow-2xl border border-[#F5C431]/20">
                <Layers className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                  Branch <span className="text-[#F5C431]">Governance</span>
                </h1>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Elite Command · Branch Control Tower</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-[#F5C431]/10 border border-[#F5C431]/20 rounded-full text-[10px] font-black uppercase tracking-widest text-[#F5C431] flex items-center gap-2">
                <Crown size={12} /> Sovereignty Layer Active
              </span>
              <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                Active Branches: {initialBranches.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-4 bg-slate-900 text-white rounded-2xl border border-white/5 hover:border-[#F5C431]/50 text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-[#F5C431]/20 flex items-center gap-2">
              <Settings2 size={14} className="text-[#F5C431]" /> Configure Network
            </button>
            <button 
              onClick={() => setActiveTab('provisioning')}
              className="px-8 py-4 bg-[#600180] text-white rounded-2xl shadow-xl shadow-[#600180]/30 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus size={16} /> Create Branch
            </button>
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-8 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as BranchTab)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-3xl transition-all min-w-[200px] border-2",
              activeTab === tab.id 
                ? "bg-white border-[#600180] shadow-xl translate-y-[-4px]" 
                : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              activeTab === tab.id ? "bg-[#600180] text-white" : "bg-white text-slate-300 shadow-inner"
            )}>
              <tab.icon size={18} />
            </div>
            <div className="text-left">
              <p className={cn("text-[10px] font-black uppercase tracking-wider", activeTab === tab.id ? "text-[#600180]" : "text-slate-400")}>
                {tab.label}
              </p>
              <p className="text-[10px] font-bold text-slate-400/60 lowercase italic">{tab.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
             {activeTab === 'network' && <TopologyVisualizer branches={initialBranches} />}
             {activeTab === 'permissions' && <PermissionMatrix branches={initialBranches} />}
             {activeTab === 'sovereignty' && <SovereigntyRules branches={initialBranches} />}
             {activeTab === 'clusters' && <GeoClustering branches={initialBranches} />}
             {activeTab === 'health' && <BranchHealthDashboard branches={initialBranches} />}
             {activeTab === 'provisioning' && <ProvisioningWizard heads={initialHeads} modules={initialModules} onComplete={() => setActiveTab('network')} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
