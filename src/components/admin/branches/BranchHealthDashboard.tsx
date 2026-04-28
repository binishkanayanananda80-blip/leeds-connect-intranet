'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, UserCheck, GraduationCap, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Activity, 
  AlertTriangle, CheckCircle2, Search
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function BranchHealthDashboard({ branches }: { branches: any[] }) {
  const chartData = useMemo(() => {
    return branches.slice(0, 6).map(b => ({
      name: b.name.split(' ')[0],
      staff: Math.floor(Math.random() * 50) + 10,
      students: Math.floor(Math.random() * 500) + 100,
      usage: Math.floor(Math.random() * 100),
    }))
  }, [branches])

  const stats = [
    { label: 'Total Enrollment', val: '12,402', change: '+12%', icon: GraduationCap, color: 'text-[#600180]' },
    { label: 'Global Attendance', val: '94.2%', change: '+0.4%', icon: UserCheck, color: 'text-emerald-500' },
    { label: 'Staff Efficiency', val: '88%', change: '-2%', icon: Users, color: 'text-amber-500' },
    { label: 'System Uptime', val: '100%', change: 'Stable', icon: Activity, color: 'text-blue-500' },
  ]

  return (
    <div className="space-y-10">
      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-[#600180]/5 transition-all" />
            <div className="relative space-y-4">
              <div className={cn("w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all group-hover:bg-white group-hover:shadow-lg", s.color)}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                <div className="flex items-end justify-between mt-1">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">{s.val}</h3>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                    s.change.startsWith('+') ? "text-emerald-500 bg-emerald-50" : 
                    s.change === 'Stable' ? "text-blue-500 bg-blue-50" : "text-amber-500 bg-amber-50"
                  )}>
                    {s.change.startsWith('+') ? <ArrowUpRight size={12} /> : s.change.startsWith('-') ? <ArrowDownRight size={12} /> : null}
                    {s.change}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── PERFORMANCE CHART ── */}
        <div className="lg:col-span-8 bg-slate-950 p-10 rounded-[3rem] border border-slate-900 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,1,128,0.1),transparent)]" />
          <div className="relative flex items-center justify-between mb-12">
            <div>
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Branch <span className="text-purple-400">Performance</span></h3>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Multi-Metric Comparative Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#600180]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Students</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#F5C431]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Usage</span>
              </div>
            </div>
          </div>

          <div className="h-[400px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#600180" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#600180" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff20" 
                  fontSize={10} 
                  fontWeight={900} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '1rem', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="students" stroke="#600180" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                <Area type="monotone" dataKey="usage" stroke="#F5C431" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── ALERTS & STATUS ── */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5C431]/5 rounded-bl-[5rem]" />
            <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight mb-8 underline decoration-[#600180] decoration-4 underline-offset-8">Critical <span className="text-[#600180]">Alerts</span></h4>
            
            <div className="space-y-6">
              {[
                { title: 'Kandy Regional', msg: 'System usage dropped below 15% threshold.', status: 'CRITICAL', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
                { title: 'Negombo Branch', msg: 'Governance compliance audit due in 48h.', status: 'WARNING', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
                { title: 'Colombo HQ', msg: 'All systems operational. Sovereign Layer stable.', status: 'HEALTHY', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((alert, i) => (
                <div key={i} className="flex gap-5 relative group">
                  <div className={cn("shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-lg", alert.bg, alert.color)}>
                    <alert.icon size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{alert.title}</span>
                      <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded border", alert.color, `border-${alert.color.split('-')[1]}-200`)}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 leading-tight">{alert.msg}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 hover:bg-black transition-all flex items-center justify-center gap-3">
              Full System Audit <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
