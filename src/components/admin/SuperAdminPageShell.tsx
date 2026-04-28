import Link from 'next/link'
import { ChevronRight, Crown, Construction } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface SuperAdminPageShellProps {
  title: string
  highlight: string
  subtitle: string
  icon: LucideIcon
  tag: string
  description: string
  roadmapItems?: string[]
  children?: ReactNode
}

export function SuperAdminPageShell({
  title,
  highlight,
  subtitle,
  icon: Icon,
  tag,
  description,
  roadmapItems,
  children,
}: SuperAdminPageShellProps) {
  const isWIP = !children

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="relative border-b border-white/5 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(96,1,128,0.15),transparent_60%)]" />
        <div className="relative max-w-[1400px] mx-auto px-8 py-10 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#600180] flex items-center justify-center shadow-xl shadow-[#600180]/20 border border-[#F5C431]/20">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-purple-400 transition-colors">
                  Elite Command
                </Link>
                <ChevronRight size={12} className="text-slate-700" />
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{tag}</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight italic">
                {title} <span className="text-purple-400">{highlight}</span>
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
          </div>
          <span className="px-4 py-2 bg-[#F5C431]/10 border border-[#F5C431]/30 rounded-full text-[10px] font-black uppercase tracking-widest text-[#F5C431] flex items-center gap-2">
            <Crown size={11} /> Super Admin Only
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        {isWIP ? (
          <div className="flex flex-col items-center justify-center py-20">
             {/* Under Construction Card */}
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(96,1,128,0.06),transparent_70%)]" />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-slate-950 border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Construction className="w-9 h-9 text-purple-400" />
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-3">{title} {highlight}</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 max-w-sm mx-auto">{description}</p>
                 {roadmapItems && (
                  <div className="border-t border-white/5 pt-8 space-y-3 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#F5C431] mb-4">Development Roadmap</p>
                    {roadmapItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#600180] shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                 )}
              </div>
            </div>

            <Link
              href="/admin"
              className="mt-14 flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/10 hover:border-purple-600/40 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-purple-400 transition-all"
            >
              <ChevronRight size={13} className="rotate-180" /> Back to Elite Command
            </Link>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
