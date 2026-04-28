'use client'

import { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, Landmark, MapPin, ChevronRight, ChevronDown, 
  Move, ZoomIn, ZoomOut, Maximize2, Settings2,
  ExternalLink, MousePointer2, Info, Globe2, X, Trash2, 
  ArrowRightLeft, AlertCircle, Check
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { relocateBranch, deleteBranch } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function TopologyVisualizer({ branches }: { branches: any[] }) {
  const router = useRouter()
  const [zoom, setZoom] = useState(1)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isRelocating, setIsRelocating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // ── RECURSIVE HIERARCHY ENGINE ──
  const hierarchy = useMemo(() => {
    // Find the root (usually the one with type HQ or the first one with no parent)
    const root = branches.find(b => b.type === 'HQ') || branches.find(b => !b.parentId) || branches[0]
    if (!root) return null

    const buildTree = (node: any) => {
      const children = branches.filter(b => b.parentId === node.id)
      return {
        ...node,
        children: children.map(buildTree)
      }
    }

    return buildTree(root)
  }, [branches])

  // Flattened lookup for the footer
  const allNodes = useMemo(() => {
    const nodes: Record<string, any> = {}
    branches.forEach(b => {
      nodes[b.id] = b
    })
    return nodes
  }, [branches])

  const selectedNode = selectedNodeId ? allNodes[selectedNodeId] : null

  // ── HANDLERS ──
  const handleRelocate = async (targetParentId: string | null) => {
    if (!selectedNodeId) return
    setIsProcessing(true)
    try {
      const res = await relocateBranch(selectedNodeId, targetParentId)
      if (res.success) {
        setIsRelocating(false)
        setSelectedNodeId(null)
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedNodeId) return
    setIsProcessing(true)
    const formData = new FormData()
    formData.append('id', selectedNodeId)
    try {
      const res = await deleteBranch(formData)
      if (res.success) {
        setIsDeleting(false)
        setSelectedNodeId(null)
        router.refresh()
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const renderNode = (node: any, level = 0) => {
    const isSelected = selectedNodeId === node.id
    const hasChildren = node.children && node.children.length > 0
    const subCount = node.children?.length || 0

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Connection Line (Vertical) */}
        {level > 0 && (
          <div className="w-0.5 h-12 bg-gradient-to-b from-slate-200 to-slate-200/50" />
        )}

        {/* Node Card */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedNodeId(node.id)
          }}
          className={cn(
            "relative w-72 p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer shadow-xl",
            isSelected 
              ? "bg-white border-[#600180] shadow-[#600180]/20 ring-4 ring-[#600180]/5" 
              : "bg-white border-transparent hover:border-slate-200 shadow-slate-200/50"
          )}
        >
          <div className="flex items-center gap-5">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500",
              node.type === 'HQ' ? "bg-slate-900 text-white shadow-lg" :
              node.type === 'REGION' ? "bg-[#600180] text-white shadow-xl ring-2 ring-[#600180]/10" : 
              isSelected ? "bg-[#F5C431] text-black" : "bg-slate-100 text-slate-500"
            )}>
              {node.type === 'HQ' ? <Landmark size={24} /> : 
               node.type === 'REGION' ? <Globe2 size={24} /> : <Building2 size={20} />}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className={cn(
                "text-[9px] font-black uppercase tracking-[0.2em] mb-1",
                node.type === 'HQ' ? "text-[#F5C431]" : 
                node.type === 'REGION' ? "text-[#600180]" : "text-slate-400"
              )}>
                {node.type} Node
              </p>
              <h4 className="text-sm font-black text-slate-900 leading-tight truncate italic">
                {node.name}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  node.status === 'ACTIVE' ? "bg-emerald-500" : 
                  node.status === 'MAINTENANCE' ? "bg-amber-500" : "bg-slate-300"
                )} />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {node.status}
                </span>
                {subCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-500 uppercase">
                    {subCount} Sub-Nodes
                  </span>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSelected && (
              <motion.div 
                layoutId="node-arrow" 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-[#600180] rotate-45" 
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Children Row */}
        {hasChildren && (
          <div className="flex flex-col items-center mt-0">
            {/* Horizontal Connection Beam */}
            <div className="w-0.5 h-12 bg-slate-200" />
            <div className="flex items-start gap-16 relative">
               {/* Line covering the breadth of children */}
               {node.children.length > 1 && (
                 <div className="absolute top-0 left-[144px] right-[144px] h-0.5 bg-slate-200" />
               )}
              {node.children.map((child: any) => renderNode(child, level + 1))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!hierarchy) return null

  return (
    <div className="w-full bg-slate-50 rounded-[3.5rem] border border-slate-100 shadow-2xl overflow-hidden relative group/canvas">
      
      {/* ── HEADER OVERLAY ── */}
      <div className="absolute top-10 left-10 z-10 space-y-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-[#F5C431] shadow-xl">
            <Settings2 size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">Network <span className="text-[#600180]">Topology</span></h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-1">Sovereign Infrastructure Control</p>
          </div>
        </div>
      </div>

      {/* ── CONTROLS OVERLAY ── */}
      <div className="absolute top-10 right-10 z-30 flex flex-col gap-4">
        <div className="bg-white/90 backdrop-blur-2xl p-3 rounded-[2rem] border border-white shadow-2xl flex flex-col gap-2 ring-1 ring-black/5">
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="w-11 h-11 flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-500 transition-all hover:scale-110"><ZoomIn size={22} /></button>
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-11 h-11 flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-500 transition-all hover:scale-110"><ZoomOut size={22} /></button>
          <div className="h-px bg-slate-100 mx-2" />
          <button onClick={() => setZoom(1)} className="w-11 h-11 flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-500 transition-all hover:scale-110"><Maximize2 size={20} /></button>
        </div>
        <div className="bg-[#600180] text-white px-6 py-4 rounded-[1.5rem] shadow-2xl flex items-center justify-center cursor-move text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
          <Move size={14} className="mr-3" /> Drag Canvas
        </div>
      </div>

      {/* ── INTERACTIVE CANVAS ── */}
      <div 
        ref={containerRef}
        className="h-[800px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] overflow-hidden cursor-grab active:cursor-grabbing relative"
        onClick={() => setSelectedNodeId(null)}
      >
        <motion.div
          drag
          dragConstraints={{ left: -1000, right: 1000, top: -500, bottom: 500 }}
          dragElastic={0.1}
          style={{ scale: zoom }}
          className="w-full h-full flex items-center justify-center min-w-[3000px] min-h-[2000px]"
        >
          <div className="flex flex-col items-center py-40">
            {renderNode(hierarchy)}
          </div>
        </motion.div>
      </div>

      {/* ── SELECTION COMMAND HUB ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            className="absolute bottom-10 left-10 right-10 bg-slate-950 p-8 rounded-[3.5rem] border-2 border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] z-40 flex items-center justify-between backdrop-blur-3xl"
          >
            <div className="flex items-center gap-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2.5rem] bg-[#600180] flex items-center justify-center text-white shadow-2xl animate-pulse ring-4 ring-white/10">
                  {selectedNode.type === 'HQ' ? <Landmark size={36} /> : 
                   selectedNode.type === 'REGION' ? <Globe2 size={36} /> : <Building2 size={32} />}
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-10 h-10 rounded-full border-4 border-slate-950 flex items-center justify-center",
                  selectedNode.status === 'ACTIVE' ? "bg-emerald-500" : "bg-amber-500"
                )}>
                  <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[#F5C431] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Info size={12} /> Institutional Entity Info
                  </span>
                  <span className="text-white/20 text-[11px] font-mono tracking-tighter">System ID: {selectedNode.id}</span>
                </div>
                <h4 className="text-white text-4xl font-black italic tracking-tighter leading-none">
                  {selectedNode.name}
                </h4>
                <div className="flex items-center gap-6">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    Operational Tier: <span className={cn(selectedNode.type === 'HQ' ? "text-[#F5C431]" : "text-[#600180]")}>{selectedNode.type}</span>
                  </p>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">
                    Presence: <span className="text-emerald-400">{selectedNode.status}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  alert(`Accessing ${selectedNode.name} Master Control...`)
                }}
                className="group px-10 py-6 bg-white text-slate-950 rounded-2xl shadow-2xl hover:bg-[#F5C431] transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-4"
              >
                Configure <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setIsRelocating(true) }}
                className="px-8 py-6 bg-slate-900 text-white border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center gap-3"
              >
                <ArrowRightLeft size={16} /> Relocate
              </button>

              <button 
                onClick={(e) => { e.stopPropagation(); setIsDeleting(true) }}
                className="p-6 bg-rose-950/30 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
              >
                <Trash2 size={24} />
              </button>
              
              <div className="w-px h-12 bg-white/10 mx-3" />
              
              <button 
                onClick={() => setSelectedNodeId(null)} 
                className="w-14 h-14 bg-slate-900 text-white/40 rounded-full hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center border border-white/5"
              >
                <X size={24} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODAL OVERLAYS ── */}
      <AnimatePresence>
        {isRelocating && selectedNode && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl space-y-10 border border-slate-100">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <ArrowRightLeft size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Relocate <span className="text-[#600180]">{selectedNode.name}</span></h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-2">Target Hierarchical Deployment</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Select Target Parent Node:</p>
                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-4 no-scrollbar">
                   {/* Root level option */}
                   <button 
                      onClick={() => handleRelocate(null)}
                      disabled={isProcessing}
                      className={cn(
                        "flex items-center justify-between p-6 rounded-[1.5rem] border-2 text-left transition-all",
                        selectedNode.parentId === null ? "border-[#600180] bg-[#600180]/5" : "border-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Maximize2 size={18} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-900">Top-Level Root</span>
                      </div>
                      {selectedNode.parentId === null && <Check className="text-[#600180]" size={18} />}
                    </button>

                  {branches.filter(b => b.id !== selectedNodeId && b.type !== 'BRANCH').map(potentialParent => (
                    <button 
                      key={potentialParent.id}
                      onClick={() => handleRelocate(potentialParent.id)}
                      disabled={isProcessing}
                      className={cn(
                        "flex items-center justify-between p-6 rounded-[1.5rem] border-2 text-left transition-all",
                        selectedNode.parentId === potentialParent.id ? "border-[#600180] bg-[#600180]/5" : "border-slate-50 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {potentialParent.type === 'HQ' ? <Landmark size={18} className="text-slate-900" /> : <Globe2 size={18} className="text-[#600180]" />}
                        <div>
                          <p className="text-[11px] font-black text-slate-900">{potentialParent.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{potentialParent.type}</p>
                        </div>
                      </div>
                      {selectedNode.parentId === potentialParent.id && <Check className="text-[#600180]" size={18} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button 
                  onClick={() => setIsRelocating(false)} 
                  className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-inter"
                >
                  Cancel Relocation
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isDeleting && selectedNode && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-rose-950/40 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl space-y-8 border border-rose-100 text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-rose-50 flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">Terminate <span className="text-rose-600">Entity?</span></h3>
                <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto">
                  You are about to permanently decommission <span className="font-black text-slate-900">{selectedNode.name}</span> and all associated institutional assets.
                </p>
                <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100">
                  ⚠️ This action is final and recorded in audit logs.
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="w-full py-6 bg-rose-600 text-white rounded-[1.5rem] shadow-xl shadow-rose-600/20 text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                >
                  {isProcessing ? 'Terminating...' : 'Confirm Decommission'}
                </button>
                <button 
                  onClick={() => setIsDeleting(false)} 
                  className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-inter"
                >
                  Abstain
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── AMBIENT CANVAS ELEMENTS ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-white/40 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 border border-white/20 opacity-0 group-hover/canvas:opacity-100 transition-opacity">
        Institutional Visualization Engine · Sovereign Topology V2
      </div>
    </div>
  )
}
