'use client'

import { useState } from 'react'
import { Check, X, Shield, Lock, Eye, Edit3, Trash2, Plus, Settings, CheckCircle2 } from 'lucide-react'
import { updatePermissionMatrix } from '@/app/admin/roles/matrix-actions'
import { toast } from 'sonner'

interface Permission {
  moduleSlug: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canApprove: boolean
  canConfig: boolean
}

export function PermissionMatrixClient({ 
  roleId, 
  roleName,
  modules, 
  matrix 
}: { 
  roleId: string
  roleName: string
  modules: any[]
  matrix: any[] 
}) {
  const [loading, setLoading] = useState<string | null>(null)
  
  const PERM_FIELDS = [
    { key: 'canView', label: 'View', icon: Eye },
    { key: 'canCreate', label: 'Create', icon: Plus },
    { key: 'canEdit', label: 'Edit', icon: Edit3 },
    { key: 'canDelete', label: 'Delete', icon: Trash2 },
    { key: 'canApprove', label: 'Approve', icon: CheckCircle2 },
    { key: 'canConfig', label: 'Config', icon: Settings }
  ]

  const handleToggle = async (moduleSlug: string, field: string, currentValue: boolean) => {
    if (roleName === 'Super Admin') return
    
    setLoading(`${moduleSlug}-${field}`)
    try {
      await updatePermissionMatrix(roleId, moduleSlug, field, !currentValue)
      toast.success('Permission updated')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-gray-100 bg-white shadow-premium">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[200px]">Functional Module</th>
            {PERM_FIELDS.map(f => (
              <th key={f.key} className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                <div className="flex flex-col items-center gap-2">
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {modules.map((m) => {
            const row = matrix.find(x => x.moduleSlug === m.slug) || {
              canView: false, canCreate: false, canEdit: false,
              canDelete: false, canApprove: false, canConfig: false
            }

            return (
              <tr key={m.slug} className="hover:bg-gray-50/30 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-none mb-1">{m.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{m.slug}</p>
                    </div>
                  </div>
                </td>
                {PERM_FIELDS.map(f => {
                  const val = (row as any)[f.key]
                  const isLoading = loading === `${m.slug}-${f.key}`
                  
                  return (
                    <td key={f.key} className="p-4 text-center">
                      <button
                        onClick={() => handleToggle(m.slug, f.key, val)}
                        disabled={roleName === 'Super Admin' || isLoading}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                          val 
                            ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' 
                            : 'bg-gray-50 text-gray-300 border border-gray-100 hover:border-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed mx-auto active:scale-95`}
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent animate-spin rounded-full" />
                        ) : val ? (
                          <Check className="w-5 h-5 font-black" />
                        ) : (
                          <X className="w-4 h-4 opacity-30" />
                        )}
                      </button>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {roleName === 'Super Admin' && (
        <div className="p-4 bg-gray-900 text-gold-leeds text-[10px] font-black uppercase tracking-widest text-center">
          <Lock className="w-3 h-3 inline-block mr-2 -mt-0.5" /> Security Protocol: Super Admin Permissions are Immutable
        </div>
      )}
    </div>
  )
}
