import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Building, Megaphone, BookOpen, Heart,
  Settings, Star, Crown, GraduationCap, ClipboardCheck, 
  Truck, ShoppingCart, Briefcase, BarChart3, 
  Database, FileText, UserSquare2, Wallet, X,
  Home, Sparkles, Trophy, MessageCircle, Video, LogOut
} from 'lucide-react'
import { LogoutButton } from '@/components/auth/LogoutButton'

const intranetModules = [
  { name: 'Dashboard',       href: '/intranet',               icon: Home,           color: 'bg-blue-50 text-blue-600' },
  { name: 'News Feed',       href: '/intranet/announcements', icon: Megaphone,      color: 'bg-purple-50 text-purple-600' },
  { name: 'Directory',       href: '/intranet/directory',     icon: Users,          color: 'bg-indigo-50 text-indigo-600' },
  { name: 'Leadership',      href: '/intranet/leadership',    icon: Crown,          color: 'bg-amber-50 text-amber-600' },
  { name: 'Knowledge Hub',   href: '/intranet/knowledge',     icon: BookOpen,       color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Welfare Hub',     href: '/intranet/welfare',       icon: Heart,          color: 'bg-rose-50 text-rose-600' },
  { name: 'Birthday Wall',   href: '/intranet/birthday-wall', icon: Sparkles,       color: 'bg-pink-50 text-pink-600' },
  { name: 'Celebrations',    href: '/intranet/celebrations',  icon: Trophy,         color: 'bg-gold-50 text-yellow-600' },
  { name: 'Chat Hub',        href: '/chat',                 icon: MessageCircle,  color: 'bg-cyan-50 text-cyan-600' },
  { name: 'Meetings',        href: '/meetings',             icon: Video,          color: 'bg-slate-50 text-slate-600' },
]

export default async function MenuPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userRole = (session?.user as any)?.roleName

  return (
    <div className="flex-1 min-h-screen bg-white md:bg-[#F8F9FC] p-6 md:p-10 space-y-10 pb-32">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">Leeds <span className="text-primary">Connect</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intranet Navigation</p>
        </div>
        <Link href="/intranet" className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 hover:text-black transition-all">
          <X size={20} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {intranetModules.map((module) => (
          <Link
            key={module.name}
            href={module.href}
            className="group flex flex-col items-center justify-center p-6 bg-white md:shadow-premium rounded-[2rem] border border-gray-50 hover:border-primary/20 hover:scale-[1.02] transition-all text-center space-y-3"
          >
            <div className={`p-4 rounded-2xl ${module.color} group-hover:scale-110 transition-transform`}>
              <module.icon size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-1">{module.name}</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.1em]">Intranet Hub</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-100">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Account Actions</p>
        
        <div className="grid grid-cols-1 gap-3">
          {['Super Admin', 'Module Admin', 'Moderator'].includes(userRole) && (
            <Link
              href="/admin"
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-primary/20 transition-all group"
            >
              <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-wider text-black">Admin Panel</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Configuration</p>
              </div>
            </Link>
          )}

          <LogoutButton className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100 hover:border-rose-500/20 transition-all group">
            <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-all">
              <LogOut size={20} />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-black uppercase tracking-wider text-black">Sign Out</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End Session</p>
            </div>
          </LogoutButton>
        </div>
      </div>
    </div>
  )
}
