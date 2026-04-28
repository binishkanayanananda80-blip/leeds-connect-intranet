'use client'

import { useState } from 'react'
import { Plus, Trash2, Shield, ArrowRight, Save, Info, Zap, AlertCircle } from 'lucide-react'
import { createMappingRule, deleteMappingRule } from '@/app/admin/categories/mapping-actions'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function RoleMappingManager({ 
  categories, 
  roles, 
  existingRules 
}: { 
  categories: any[]
  roles: any[]
  existingRules: any[]
}) {
  const [loading, setLoading] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState('')

  const selectedCategory = categories.find(c => c.id === selectedCatId)

  return (
    <div className="space-y-8" suppressHydrationWarning>
      {/* Rule Builder Header */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md">
                   <Zap className="w-6 h-6 text-primary shadow-xl shadow-primary/40" />
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-none uppercase">Rule <span className="text-primary">Engine</span></h2>
             </div>
             <p className="text-sm font-medium text-slate-400 leading-relaxed">
               Assign automated logic to your organizational architecture. 
               Map professional categories to system roles to enforce governance protocols instantly.
             </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">Active Automations</span>
             <span className="text-4xl font-black text-white">{existingRules.length}</span>
          </div>
        </div>
      </div>

      {/* Builder Form */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8">
        <form 
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            try {
              const fd = new FormData(e.currentTarget)
              await createMappingRule(fd)
              toast.success('Automation rule deployed successfully')
              e.currentTarget.reset()
              setSelectedCatId('')
            } catch (err: any) {
              toast.error(err.message || 'Deployment failed')
            } finally {
              setLoading(false)
            }
          }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IF Main Category</label>
            <select 
              name="categoryId" 
              required 
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Select Category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AND Sub Category</label>
            <select 
              name="subCategoryId" 
              className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 text-sm font-black focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All (General Rule)</option>
              {selectedCategory?.subCategories?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-primary" /> THEN Assign Role
            </label>
            <select 
              name="roleId" 
              required 
              className="w-full h-14 bg-primary/5 border border-primary/10 rounded-2xl px-5 text-sm font-black text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">Select Role...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full" /> : <Save className="w-4 h-4" />}
            Deploy Rule
          </button>
        </form>
      </div>

      {/* Active Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {existingRules.map((rule, idx) => (
            <motion.div 
              key={rule.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-primary/5 transition-colors" />
               
               <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logic Flow</span>
                           <Shield className="w-3 h-3 text-primary" />
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                           {rule.category.name}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                           {rule.subCategory?.name || 'All Sub-Categories'}
                        </p>
                     </div>
                     <button 
                        onClick={async () => {
                           if (confirm('Deactivate this automation?')) {
                              try {
                                 await deleteMappingRule(rule.id)
                                 toast.success('Automation rule purged')
                              } catch(e) { toast.error('Purge failed') }
                           }
                        }}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>

                  <div className="flex items-center gap-4 py-4 pt-6 border-t border-slate-50">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-primary" />
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Target Authority</p>
                        <p className="text-base font-black text-slate-900 leading-none">{rule.role.name}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {existingRules.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4">
             <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                <AlertCircle className="w-8 h-8" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none">Global Architecture Empty</p>
                <p className="text-[10px] font-medium text-slate-400">Deploy your first automation rule to initialize the governance engine.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
