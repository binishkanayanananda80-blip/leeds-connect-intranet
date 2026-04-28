'use client'

import { useState } from 'react'
import { Shield, ShieldCheck, Users, Save, Info, AlertCircle, ChevronRight, Layout, Settings, Lock, Loader2 } from 'lucide-react'
import { updateRolePermissions } from '@/app/admin/roles/actions'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { UserAvatar } from '@/components/ui/UserAvatar'
import Link from 'next/link'
import { PermissionMatrixClient } from './PermissionMatrixClient'

export function RolesManagerClient({ roles, modules }: { roles: any[], modules: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleUpdate = async (roleId: string, permissions: string) => {
    setLoadingId(roleId)
    const fd = new FormData()
    fd.append('roleId', roleId)
    fd.append('permissions', permissions)
    
    try {
      await updateRolePermissions(fd)
      toast.success('Permissions updated successfully')
    } catch (err: any) {
      toast.error(err.message || 'Update failed')
    } finally {
      setLoadingId(null)
    }
  }

  const ROLE_DESCRIPTIONS: Record<string, string> = {
    'Super Admin': 'Supreme authority. Absolute control over platform infrastructure, security, and global data hierarchies.',
    'Corporate Admin': 'Personnel governance. Oversight of the staff directory, onboarding, and official corporate announcements.',
    'IT Admin': 'Technical infrastructure. Management of platform systems, integrations, and server protocols.',
    'Network Admin': 'Network-wide operation management. Oversight of multi-branch data and regional communications.',
    'Branch Admin': 'Regional operational control. Managing branch-specific staff and local resource distribution workflows.',
    'Moderator': 'Hub integrity enforcement. Reviewing and moderating internal publications and discourse engagement.',
    'User': 'Standard engagement. Participating in the intranet ecosystem with full view and reaction access.',
  }

  return (
    <div className="space-y-10">
      {roles.map((role, index) => {
        const desc = ROLE_DESCRIPTIONS[role.name] || 'Custom system role focusing on specific coordination tasks within the intranet.'
        
        return (
          <motion.div 
            key={role.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[3rem] border border-gray-100 shadow-premium overflow-hidden group"
          >
            <div className="p-8 md:p-12 flex flex-col xl:flex-row gap-12">
              {/* Role Identity Card */}
              <div className="xl:w-80 shrink-0 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-gray-900 leading-none">{role.name}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 px-2 py-1 bg-gray-50 rounded-lg w-fit border border-gray-100 italic">Access Group</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 space-y-4">
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Population</span>
                      <span className="text-xs font-black text-primary">{role.users?.length || 0} assigned</span>
                   </div>
                   <div className="flex -space-x-2">
                     {(role.users || []).slice(0, 5).map((u: any) => (
                       <div key={u.id} className="ring-2 ring-white rounded-full overflow-hidden w-8 h-8 bg-gray-100 bg-center bg-cover">
                          <UserAvatar imageUrl={u.image} name={u.name} size="xs" />
                       </div>
                     ))}
                     {(role.users?.length || 0) > 5 && (
                       <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{(role.users?.length || 0) - 5}
                       </div>
                     )}
                   </div>
                   <Link href="/admin/users" className="block text-[10px] font-black text-primary uppercase tracking-widest hover:underline pt-2">
                      Personnel Management →
                   </Link>
                </div>
              </div>

              {/* Permissions Control Interface */}
              <div className="flex-1 space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full bg-gold-leeds animate-pulse" />
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority Policy Definition</h4>
                    </div>
                    {role.name === 'Super Admin' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/20">
                         <Lock className="w-3 h-3" /> System Immutable
                      </div>
                    )}
                 </div>

                  <PermissionMatrixClient 
                     roleId={role.id} 
                     roleName={role.name}
                     modules={modules}
                     matrix={role.matrix || []}
                  />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
