'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ShieldCheck, ArrowUpRight, Clock, AlertCircle, BookOpen,
  Crown, Lock, Building2, Users, ShieldAlert, BarChart3,
  TrendingUp, Settings, BellRing, Globe2, HardDrive, Paintbrush,
  Zap, ChevronRight, Layers, Database, Trash2, Activity,
  ArrowRight, Search, LayoutGrid, List, FileCheck, Video, 
  Wallet, GraduationCap, Truck, Megaphone, UserSquare2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, any> = {
  Users: Users,
  Building: Building2,
  Megaphone: Megaphone,
  BookOpen: BookOpen,
  ShieldCheck: ShieldCheck,
  ShieldAlert: ShieldAlert,
  MessageSquare: Globe2,
  Video: Video,
  FileCheck: FileCheck,
  UserSquare2: UserSquare2,
  Wallet: Wallet,
  GraduationCap: GraduationCap,
  Truck: Truck,
  Palette: Paintbrush,
  Clock: Clock,
  Database: Database,
  LayoutDashboard: LayoutGrid,
  AlertCircle: AlertCircle,
};

// ── SUPER ADMIN CONTROL DEFINITIONS ──
const SUPER_ADMIN_CONTROLS = [
  { title: 'Company Management', desc: 'Organizational provisioning & structure.', href: '/admin/super/companies', icon: Building2, tag: 'Org' },
  { title: 'Advanced Branch Mgmt', desc: 'Hierarchy, topology, and sovereignty.', href: '/admin/super/branches', icon: Layers, tag: 'Infra' },
  { title: 'Full User Controls', desc: 'Mass operations, entity merging.', href: '/admin/super/users', icon: Users, tag: 'Staff' },
  { title: 'RBAC Engine', desc: '6-factor matrix editor across all roles.', href: '/admin/super/rbac', icon: ShieldAlert, tag: 'Security' },
  { title: 'System Trash Bin', desc: 'Secure recovery of deleted entities.', href: '/admin/super/trash', icon: Trash2, tag: 'Data' },
  { title: 'Branding & White-label', desc: 'Custom logos, pallets, and domains.', href: '/admin/super/branding', icon: Paintbrush, tag: 'Identity' },
  { title: 'Module Activation', desc: 'Configure ERP modules globally.', href: '/admin/super/modules', icon: Zap, tag: 'ERP' },
  { title: 'System-Wide Settings', desc: 'Global security & feature flags.', href: '/admin/super/settings', icon: Settings, tag: 'Config' },
];

const containerVariants: import('framer-motion').Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const cardVariants: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function AdminClient({
  coreModules,
  functionalModules,
  roleName,
  alertCount,
  auditLogs = [],
  isSuperAdmin = false,
}: {
  coreModules: any[];
  functionalModules: any[];
  roleName: string;
  alertCount: number;
  auditLogs?: any[];
  isSuperAdmin?: boolean;
}) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-6 pb-32 space-y-12" suppressHydrationWarning>

      {/* ── PROFESSIONAL DASHBOARD HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-premium overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#600180] via-[#600180] to-[#F5C431]" />
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(circle_at_top_right,rgba(245,196,49,0.05),transparent)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#600180] flex items-center justify-center shadow-xl shadow-[#600180]/10 border border-white/10 group">
                <ShieldCheck className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
                    Admin <span className="text-[#600180]">Dashboard</span>
                  </h1>
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hidden md:block">
                    Layer 01
                  </span>
                </div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Leeds Connect Institutional Control Tower</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#600180] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#600180]">{roleName}</span>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-[#F5C431]/10 border border-[#F5C431]/20 rounded-full">
                  <Crown size={12} className="text-[#A98B44]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#A98B44]">Sovereign Access</span>
                </div>
              )}
              {alertCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-full">
                  <AlertCircle size={12} className="text-rose-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">{alertCount} Notifications</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 bg-slate-50/50 p-2 rounded-3xl border border-slate-100">
             <div className="flex items-center gap-8 px-8 py-4">
                {[
                  { label: 'Network', val: '12ms', icon: Activity, color: 'text-emerald-500' },
                  { label: 'Active Modules', val: functionalModules.length, icon: LayoutGrid, color: 'text-[#600180]' },
                  { label: 'Compliance', val: '100%', icon: ShieldCheck, color: 'text-[#A98B44]' },
                ].map((stat, i) => (
                  <div key={stat.label} className="flex flex-col items-center gap-1">
                    <div className={cn("flex items-center gap-2 font-black text-xl tracking-tight text-slate-900")}>
                       <stat.icon size={16} className={stat.color} />
                       {stat.val}
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      {/* ── SOVEREIGN CONTROLS (SUPER ADMIN ONLY) ── */}
      {isSuperAdmin && (
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-2">
             <div className="w-1 h-8 bg-[#F5C431] rounded-full" />
             <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
               Sovereign <span className="text-[#A98B44]">Control Hub</span>
             </h2>
           </div>

           <motion.div 
             variants={containerVariants}
             initial="hidden"
             animate="visible"
             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
           >
              {SUPER_ADMIN_CONTROLS.map((control) => (
                <motion.div key={control.href} variants={cardVariants}>
                  <Link href={control.href} className="group block h-full">
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#F5C431]/30 transition-all duration-300 relative overflow-hidden h-full flex flex-col gap-4">
                       <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                          <control.icon size={80} />
                       </div>
                       
                       <div className="flex items-center justify-between relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-[#F5C431]/10 flex items-center justify-center text-[#A98B44] group-hover:bg-[#F5C431] group-hover:text-white transition-all duration-500">
                             <control.icon size={20} />
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100">{control.tag}</span>
                       </div>

                       <div className="space-y-1 relative z-10">
                          <h4 className="text-sm font-black text-slate-900 group-hover:text-[#A98B44] transition-colors">{control.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-tight">{control.desc}</p>
                       </div>

                       <div className="mt-auto pt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-[#A98B44] transition-colors relative z-10">
                          Master Control <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
           </motion.div>
        </section>
      )}

      {/* ── CORE INSTITUTIONAL CONTROLS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-1 h-8 bg-[#600180] rounded-full" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  Core <span className="text-[#600180]">Institutional</span> Infrastructure
                </h2>
              </div>
            </div>

            <motion.div 
               variants={containerVariants}
               initial="hidden"
               animate="visible"
               className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {coreModules.map((module) => {
                const Icon = ICON_MAP[module.icon] || Layers;
                return (
                  <motion.div key={module.title} variants={cardVariants} className="flex flex-col gap-3">
                    <Link href={module.href} className="flex-1 group">
                      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#600180]/20 transition-all duration-500 h-full flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                           <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#600180] group-hover:text-white transition-all duration-500 shadow-inner ring-4 ring-transparent group-hover:ring-[#600180]/10">
                              <Icon size={24} />
                           </div>
                           {module.badge !== undefined && (
                             <span className="px-4 py-1.5 bg-slate-950 text-white rounded-xl text-[10px] font-black tracking-widest shadow-lg">
                                {module.badge}
                             </span>
                           )}
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-lg font-black text-slate-900 leading-tight">{module.title}</h4>
                          <p className="text-xs text-slate-400 font-bold leading-relaxed">{module.desc}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 group-hover:text-[#600180] transition-colors">
                           Enter Module <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                    
                    {module.advancedHref && (
                      <Link 
                        href={module.advancedHref} 
                        className="flex items-center justify-between px-6 py-4 bg-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#F5C431] hover:bg-[#600180] transition-all group"
                      >
                         <span className="flex items-center gap-3"><Crown size={12} /> Advanced Governance</span>
                         <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <div className="w-1 h-8 bg-[#600180] rounded-full opacity-30" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Active <span className="text-slate-400">ERP Sub-Systems</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {functionalModules.map((module) => {
                const Icon = ICON_MAP[module.icon] || Globe2;
                return (
                  <Link key={module.id} href={`/admin/modules/${module.slug}`} className="group h-full">
                    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl hover:shadow-2xl hover:border-[#600180]/10 transition-all h-full flex flex-col gap-5">
                       <div className="flex items-center justify-between">
                          <div className="w-11 h-11 rounded-xl bg-[#600180]/5 flex items-center justify-center text-[#600180] group-hover:bg-[#600180] group-hover:text-white transition-all duration-500">
                             <Icon size={18} />
                          </div>
                          <div className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5", module.isActive ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300")}>
                             <div className={cn("w-1 h-1 rounded-full", module.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                             {module.isActive ? 'Online' : 'Disabled'}
                          </div>
                       </div>
                       <div>
                          <h4 className="text-sm font-black text-slate-900 mb-1">{module.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold line-clamp-2 leading-tight">{module.description || 'Institutional business vertical activation pending.'}</p>
                       </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN: TELEMETRY & AUDIT ── */}
        <div className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
               <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-4">
                    <div className="w-1 h-8 bg-slate-900 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                      Live <span className="text-[#600180]">Audit</span>
                    </h2>
                  </div>
                  <Link href="/admin/audit-logs" className="text-[9px] font-black uppercase tracking-widest text-[#600180] hover:underline">
                    Master Stream
                  </Link>
               </div>

               <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden divide-y divide-slate-50">
                  {auditLogs.slice(0, 7).map((log: any) => (
                    <div key={log.id} className="p-6 hover:bg-slate-50 transition-all group">
                       <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-[#600180] transition-colors">
                             <Clock size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between mb-0.5">
                                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-wide">{log.user.name}</p>
                                <span className="text-[9px] font-bold text-slate-300">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <p className="text-xs text-slate-400 font-bold leading-tight truncate">
                                <span className="text-[#600180] font-black uppercase mr-1">{log.action}</span>
                                {log.entity} Record
                             </p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </section>
        </div>
      </div>
    </div>
  );
}
