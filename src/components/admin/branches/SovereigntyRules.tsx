'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldAlert, Landmark, UserCheck, Database, 
  Settings2, ChevronRight, Zap, Target, Lock, 
  Settings, Save, Search, Filter
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function SovereigntyRules({ branches }: { branches: any[] }) {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]?.id || null)

  const AUTONOMY_LEVELS = [
    { id: 'full', label: 'Fully Autonomous', color: 'bg-emerald-500', desc: 'No central oversight required for daily operations.' },
    { id: 'semi', label: 'Semi-Controlled', color: 'bg-[#F5C431]', desc: 'Major actions require HO approval.' },
    { id: 'strict', label: 'Fully Controlled', color: 'bg-[#600180]', desc: 'All operations managed by Head Office.' },
  ]

  const GOVERNANCE_RULES = [
    { id: 'fin_limit', label: 'Financial Approval Limit', icon: Landmark, type: 'currency' },
    { id: 'hr_indep', label: 'HR Independence', icon: UserCheck, type: 'toggle' },
    { id: 'data_rest', label: 'Data visibility Restriction', icon: Database, type: 'toggle' },
    { id: 'local_proc', label: 'Local Procurement', icon: Target, type: 'toggle' },
  ]

  const branchData = branches.find(b => b.id === selectedBranch) || branches[0]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── LEFT: BRANCH SELECTOR ── */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sticky top-10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight underline decoration-[#F5C431] decoration-4 underline-offset-4">Select <span className="text-[#600180]">Unit</span></h4>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Search size={14} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                <Filter size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={cn(
                  "w-full p-5 rounded-2xl flex items-center gap-4 transition-all border-2",
                  selectedBranch === b.id 
                    ? "bg-[#600180]/5 border-[#600180] shadow-lg shadow-[#600180]/10" 
                    : "bg-slate-50 border-transparent hover:border-slate-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xl shadow-[#600180]/20",
                  selectedBranch === b.id ? "bg-[#600180]" : "bg-slate-300"
                )}>
                  {b.name[0]}
                </div>
                <div className="text-left">
                  <p className={cn("text-[11px] font-black uppercase tracking-tight", selectedBranch === b.id ? "text-[#600180]" : "text-slate-600")}>
                    {b.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {b.id.slice(-6)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: RULE ENGINE ── */}
      <div className="lg:col-span-8 space-y-8">
        {/* Header Summary */}
        <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-900 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,196,49,0.15),transparent)]" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-4">
              <div className="px-4 py-1.5 bg-[#F5C431]/20 border border-[#F5C431]/40 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-[#F5C431] w-fit">
                Branch Sovereignty Settings
              </div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                Sovereignty <span className="text-purple-400">Rules</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-1">Target Authority</p>
              <h3 className="text-xl font-black text-[#F5C431] italic">{branchData?.name.split(' ')[0]}</h3>
            </div>
          </div>
        </div>

        {/* Autonomy Level Picker */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl p-10 space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 underline decoration-slate-200 decoration-2 underline-offset-8">1. Set Autonomy Level</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {AUTONOMY_LEVELS.map(level => (
                <button
                  key={level.id}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all text-left space-y-4 group",
                    level.id === 'semi' ? "bg-slate-50 border-[#F5C431] shadow-2xl shadow-[#F5C431]/10" : "bg-white border-transparent hover:border-slate-100"
                  )}
                >
                  <div className={cn("w-3 h-3 rounded-full", level.color)} />
                  <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-900 group-hover:text-[#600180] transition-colors">{level.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">{level.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Rule Configurator */}
          <div className="space-y-8">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 underline decoration-slate-200 decoration-2 underline-offset-8">2. Operational Governance Rules</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GOVERNANCE_RULES.map(rule => (
                  <div key={rule.id} className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-inner border border-slate-100 flex items-center justify-center text-[#600180]">
                        <rule.icon size={22} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#600180]">{rule.label}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">HO Master Policy-7</p>
                      </div>
                    </div>
                    {rule.type === 'currency' ? (
                      <div className="flex items-center gap-2 bg-white border border-slate-100 p-2 rounded-xl shadow-lg">
                        <span className="text-[10px] font-black text-slate-400">SRR</span>
                        <input type="text" defaultValue="500,000" className="w-20 bg-transparent text-[11px] font-black text-[#F5C431] text-right focus:outline-none" />
                      </div>
                    ) : (
                      <div className="w-12 h-7 bg-[#600180] rounded-full relative p-1 cursor-pointer">
                        <div className="absolute right-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                      </div>
                    )}
                  </div>
                ))}
             </div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                <Settings size={20} />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">Advanced Logic Settings<br /><span className="text-[#600180] font-black">Open Advanced Builder</span></p>
            </div>
            <button className="px-12 py-5 bg-[#600180] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-[#600180]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
              <Save size={16} className="text-[#F5C431]" /> Save Governance Set
            </button>
          </div>
        </div>

        {/* Audit Footnote */}
        <div className="p-8 bg-slate-100 rounded-[2.5rem] flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#F5C431] shadow-xl">
            <ShieldAlert size={24} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight underline decoration-[#600180] decoration-2 underline-offset-4">Legal Disclaimer · Sovereignty Layer</p>
            <p className="text-[10px] font-bold text-slate-500 leading-tight mt-1">Changes to branch autonomy levels may affect legal compliance and financial reporting structures in real-time. High-risk operations require HO Sovereign approval.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
