'use client'

import { useState } from 'react'
import { 
  Shield, Zap, ArrowRight, Save, Trash2, Layers, 
  Grid, List, CheckCircle2, AlertCircle, Info, 
  Settings, Key, Globe, Box, Users
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createMappingRule, deleteMappingRule } from '@/app/admin/categories/mapping-actions'
import { toast } from 'sonner'

export function GovernanceMapHub({
  categories,
  roles,
  permissionLevels,
  existingRules
}: {
  categories: any[]
  roles: any[]
  permissionLevels: any[]
  existingRules: any[]
}) {
  const [activeTab, setActiveTab] = useState<'grid' | 'builder' | 'tiers'>('grid')
  const [loading, setLoading] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState('')

  const selectedCategory = categories.find(c => c.id === selectedCatId)

  const availableModules = [
    { id: 'intranet', name: 'Intranet Hub', description: 'Core communication & news' },
    { id: 'hr', name: 'HR Management', description: 'Staffing & operations' },
    { id: 'finance', name: 'Financial Hub', description: 'Fees & accounting' },
    { id: 'examination', name: 'Exams & Assessment', description: 'Grading & reports' },
    { id: 'library', name: 'Knowledge Hub (Library)', description: 'Resource management' },
    { id: 'student-hub', name: 'Student Information', description: 'Registry & profiles' },
    { id: 'crm', name: 'Marketing & CRM', description: 'Leads & engagement' },
    { id: 'inventory', name: 'Inventory & Assets', description: 'Universal assets' }
  ]

  return (
    <div className="space-y-10" suppressHydrationWarning>
      {/* Premium Header */}
      <div className="relative group p-8 md:p-12 bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] -mr-48 -mt-48 rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -ml-32 -mb-32 rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">Governance <span className="text-primary">& Map</span></h1>
                <p className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">Universal Authority Mapping Framework v2.0</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => setActiveTab('grid')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Grid className="w-4 h-4" /> Universal Grid
              </button>
              <button 
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'builder' ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Zap className="w-4 h-4" /> Policy Builder
              </button>
              <button 
                onClick={() => setActiveTab('tiers')}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'tiers' ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Layers className="w-4 h-4" /> Authority Tiers
              </button>

              <a 
                href="/admin/governance/summary"
                className="flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all bg-white/5 text-slate-400 hover:bg-white/10"
              >
                <Users className="w-4 h-4" /> Access Summary
              </a>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Protocols</p>
              <p className="text-3xl font-black text-white">{existingRules.length}</p>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/5 text-center min-w-[140px]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authority Levels</p>
              <p className="text-3xl font-black text-primary">07</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: UNIVERSAL GRID */}
        {activeTab === 'grid' && (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-4">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Master <span className="text-slate-400">Governance Matrix</span></h3>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full">Viewing {existingRules.length} Mapping Rules</p>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Organizational Hub</th>
                        <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Professional Position</th>
                        <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">System Role</th>
                        <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Auth Tier</th>
                        <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Module Scope</th>
                        <th className="px-8 py-6 text-center border-b border-slate-100"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {existingRules.map((rule) => {
                        const tier = permissionLevels.find(pl => pl.id === rule.permissionLevelId) || 
                                     permissionLevels.find(pl => pl.id === rule.role?.permissionLevelId)
                        
                        return (
                          <tr key={rule.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500">
                                  {rule.category.name[0]}
                                </div>
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{rule.category.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {rule.subCategory?.name || 'All Sub-Categories'}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <span className="inline-flex items-center px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/10">
                                {rule.role.name}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-center">
                              {tier ? (
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-black border ${tier.rank <= 3 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                                  L{tier.rank}
                                </span>
                              ) : '--'}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-black uppercase tracking-tighter">intranet</span>
                                {rule.moduleAccessScope?.split(',').map((mod: string) => (
                                  <span key={mod} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-tighter">
                                    {mod.trim()}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button 
                                onClick={async () => {
                                  if (confirm('Deactivate this policy?')) {
                                    try {
                                      await deleteMappingRule(rule.id)
                                      toast.success('Policy retracted')
                                    } catch (e) { toast.error('Retraction failed') }
                                  }
                                }}
                                className="p-2.5 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}

                      {existingRules.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-20 text-center">
                            <div className="flex flex-col items-center justify-center gap-4 opacity-30">
                              <Settings className="w-12 h-12 text-slate-300" />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">Governance Matrix Offline. Deploy a rule to begin.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {/* TAB: POLICY BUILDER */}
        {activeTab === 'builder' && (
          <motion.div 
            key="builder"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter">Policy <span className="text-slate-400">Architect</span></h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Design and deploy structural automation protocols</p>
                  </div>
               </div>

               <form 
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setLoading(true)
                    try {
                      const fd = new FormData(e.currentTarget)
                      await createMappingRule(fd)
                      toast.success('Protocol deployed successfully')
                      e.currentTarget.reset()
                      setSelectedCatId('')
                    } catch (err: any) {
                      toast.error(err.message || 'Deployment failed')
                    } finally {
                      setLoading(false)
                    }
                  }}
                  className="space-y-10"
               >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Condition 1: Category */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IF Organizational Hub</label>
                      <div className="relative group">
                        <select 
                          name="categoryId" 
                          required 
                          onChange={(e) => setSelectedCatId(e.target.value)}
                          className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select Category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <Globe className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>

                    {/* Condition 2: Sub-Category */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AND Professional Position</label>
                      <div className="relative group">
                        <select 
                          name="subCategoryId" 
                          className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">All (General Rule)</option>
                          {selectedCategory?.subCategories?.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <Box className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>

                    {/* Result 1: System Role */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-primary" /> THEN Assign System Role
                      </label>
                      <div className="relative group">
                        <select 
                          name="roleId" 
                          required 
                          className="w-full h-16 bg-primary/5 border border-primary/20 rounded-2xl px-6 text-sm font-black text-primary hover:bg-primary/10 transition-all outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Select Role...</option>
                          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Multi-Select: Modules */}
                  <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Enforced Module Provisioning</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {availableModules.map((mod) => (
                        <label 
                          key={mod.id} 
                          className="group relative cursor-pointer"
                        >
                          <input 
                            type="checkbox" 
                            name={`module_${mod.id}`}
                            className="peer hidden"
                            defaultChecked={mod.id === 'intranet'}
                            disabled={mod.id === 'intranet'}
                          />
                          <div className="h-full p-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:text-white transition-all group-hover:border-indigo-300 shadow-sm peer-checked:shadow-lg peer-checked:shadow-indigo-500/30">
                            <h5 className="text-[10px] font-black uppercase tracking-widest mb-1">{mod.name}</h5>
                            <p className="text-[9px] opacity-60 font-bold leading-tight">{mod.description}</p>
                            {mod.id === 'intranet' && (
                              <div className="absolute top-3 right-3">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 peer-checked:text-white" />
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                    {/* Module Slugs Input Wrapper */}
                    <input type="hidden" name="moduleAccessScope" value="" />
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="px-10 py-5 bg-slate-900 hover:bg-primary text-white rounded-2xl flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest shadow-2xl transition-all disabled:opacity-50 active:scale-95 group"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
                      ) : (
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                      Deploy Governance Policy
                    </button>
                  </div>
               </form>
            </div>
          </motion.div>
        )}

        {/* TAB: AUTHORITY TIERS */}
        {activeTab === 'tiers' && (
          <motion.div 
            key="tiers"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {permissionLevels.sort((a, b) => a.rank - b.rank).map((level) => (
              <div 
                key={level.id}
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all h-full flex flex-col"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 transition-colors ${level.rank <= 2 ? 'bg-indigo-50' : 'bg-slate-50'}`} />
                
                <div className="relative z-10 flex flex-col h-full gap-6">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg ${level.rank <= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {level.rank}
                    </div>
                    <Key className={`w-5 h-5 ${level.rank <= 2 ? 'text-indigo-400' : 'text-slate-300'}`} />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight mb-2 uppercase">{level.name}</h4>
                    <p className="text-xs font-bold text-slate-400 leading-relaxed italic pr-4">
                      "{level.description}"
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enforced Capabilities</p>
                    <div className="flex flex-wrap gap-2">
                       {level.rank === 1 && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">Strategic View</span>}
                       {level.rank <= 2 && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">Core Config</span>}
                       {level.rank <= 4 && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">Module Admin</span>}
                       <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">Standard Auth</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
