'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Search, User, Clock, Tag } from 'lucide-react'
import { getAuditLogs } from '../employee/actions'
import { format } from 'date-fns'
import { UserAvatar } from '@/components/ui/UserAvatar'

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-rose-100 text-rose-700',
  SUSPEND: 'bg-amber-100 text-amber-700',
  REACTIVATE: 'bg-teal-100 text-teal-700',
  STATUS_UPDATE: 'bg-indigo-100 text-indigo-700',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  useEffect(() => {
    getAuditLogs(500).then(data => {
      setLogs(data)
      setFiltered(data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let result = logs
    if (actionFilter !== 'ALL') result = result.filter(l => l.action === actionFilter)
    if (search) result = result.filter(l =>
      l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.entity?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, actionFilter, logs])

  const actions = ['ALL', 'CREATE', 'UPDATE', 'DELETE', 'SUSPEND', 'REACTIVATE', 'STATUS_UPDATE']

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 flex items-center gap-3">
            <Shield className="text-primary w-7 h-7" /> Audit Log
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Full security trail of all admin actions.</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-gray-900">{filtered.length}</p>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by admin, entity, or action details..." className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {actions.map(a => (
            <button key={a} onClick={() => setActionFilter(a)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${actionFilter === a ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-[2.5rem] shadow-premium border border-white overflow-hidden">
        {loading ? (
          <div className="p-16 text-center animate-pulse text-gray-400 font-bold text-xs uppercase tracking-widest">Loading audit logs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold text-sm">No audit events found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px] border-b border-gray-100">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((log, i) => (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-black text-gray-700">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{format(new Date(log.createdAt), 'hh:mm:ss a')}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <UserAvatar imageUrl={log.user?.image} name={log.user?.name || 'System'} size="xs" />
                        <span className="font-bold text-gray-700 whitespace-nowrap">{log.user?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-500'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-600 uppercase text-[10px] tracking-widest">{log.entity}</td>
                    <td className="p-4 text-gray-500 font-medium max-w-xs truncate">{log.details || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
