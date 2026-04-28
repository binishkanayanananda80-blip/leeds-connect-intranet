'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ShieldAlert, RefreshCcw, Trash2, Search, Trash, AlertCircle, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { restoreEntity, permanentlyDeleteEntity, emptyTrashBin } from '@/app/admin/users/actions'

export function TrashClient({ entities }: { entities: any[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmingRestore, setConfirmingRestore] = useState<any>(null)
  const [confirmingPermanentDelete, setConfirmingPermanentDelete] = useState<any>(null)
  const [emptying, setEmptying] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const filtered = entities.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.entityId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRestore = (entity: any) => {
    setConfirmingRestore(entity)
  }

  const executeRestoreAction = async () => {
    if (!confirmingRestore) return
    setIsProcessing(true)
    try {
      await restoreEntity(confirmingRestore.id)
      toast.success(`${confirmingRestore.name} has been restored successfully.`)
      setConfirmingRestore(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermanentDelete = (entity: any) => {
    setConfirmingPermanentDelete(entity)
  }

  const executeDeleteAction = async () => {
    if (!confirmingPermanentDelete) return
    setIsProcessing(true)
    try {
      await permanentlyDeleteEntity(confirmingPermanentDelete.id)
      toast.success(`${confirmingPermanentDelete.name} has been instantly permanently deleted.`)
      setConfirmingPermanentDelete(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEmptyTrash = async () => {
    if (!confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY END all ${entities.length} entities in the trash? This is irreversible.`)) return
    setEmptying(true)
    try {
      await emptyTrashBin()
      toast.success('System Trash Bin has been emptied. Data is gone forever.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setEmptying(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Trashed Entities..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#600180]/20 transition-all"
          />
        </div>
        
        {entities.length > 0 && (
          <button 
            onClick={handleEmptyTrash} 
            disabled={emptying || entities.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black shadow-lg transition-all disabled:opacity-50"
          >
            <Trash className="w-4 h-4" /> {emptying ? 'Destroying Data...' : 'Empty Trash Bin'}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
             <ShieldAlert className="w-16 h-16 opacity-30 mb-4" />
             <p className="font-bold tracking-widest uppercase">The Trash Bin is Empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(e => (
              <div key={e.id} className={`bg-white p-5 rounded-3xl border ${processingId === e.id ? 'opacity-50' : 'border-slate-100'} hover:border-primary/20 hover:shadow-xl transition-all flex flex-col gap-4 relative overflow-hidden group shadow-sm`}>
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2.5 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-lg border border-white/10 shadow-lg">TRASHED</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <UserAvatar imageUrl={e.image} firstName={e.firstName} lastName={e.lastName} name={e.name} size="md" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{e.name || '—'}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{e.entityId || 'Unassigned'}</p>
                    <p className="text-[10px] text-[#600180] font-bold uppercase mt-1">{e.role?.name || 'No Role'}</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mt-2 p-3 bg-slate-50 rounded-xl space-y-1">
                  <p><strong>Deleted At:</strong> {e.deletedAt ? new Date(e.deletedAt).toLocaleString() : 'N/A'}</p>
                  {e.branch && <p><strong>Branch:</strong> {e.branch.name}</p>}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-slate-100 hidden group-hover:flex">
                  <button onClick={() => handleRestore(e)} disabled={isProcessing}
                    className="flex-1 shrink-0 flex justify-center items-center gap-2 py-3 bg-[#600180] text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#600180]/90 shadow-lg shadow-[#600180]/20 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button onClick={() => handlePermanentDelete(e)} disabled={isProcessing}
                    className="shrink-0 p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all" title="Delete Permanently">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── RESTORE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {confirmingRestore && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!isProcessing) setConfirmingRestore(null) }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#600180] via-[#F5C431] to-[#600180] animate-gradient-x" />
              <div className="w-20 h-20 rounded-3xl bg-[#600180]/5 flex items-center justify-center text-[#600180] mx-auto shadow-inner border border-[#600180]/10">
                <RotateCcw size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight underline decoration-[#F5C431] decoration-4 underline-offset-4">Restore Record?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Do you want to restore <span className="text-slate-900 font-bold">{confirmingRestore.name}</span> back to the active Entity Registry?
                </p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button onClick={() => setConfirmingRestore(null)} disabled={isProcessing}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all">
                  Cancel
                </button>
                <button onClick={executeRestoreAction} disabled={isProcessing}
                  className="flex-1 py-4 bg-[#600180] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#600180]/30 hover:bg-[#600180]/90 transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Restore'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PERMANENT DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {confirmingPermanentDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!isProcessing) setConfirmingPermanentDelete(null) }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center space-y-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-slate-800 to-black" />
              <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-2xl">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Annihilate Record?</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  <span className="text-slate-900 font-black italic">FINAL WARNING:</span> You are about to permanently delete <span className="text-slate-900 font-bold underline decoration-[#F5C431]">{confirmingPermanentDelete.name}</span>. This is irreversible.
                </p>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <button onClick={() => setConfirmingPermanentDelete(null)} disabled={isProcessing}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all">
                  Abort
                </button>
                <button onClick={executeDeleteAction} disabled={isProcessing}
                  className="flex-1 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-black/40 hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Destroying...' : 'Yes, Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
