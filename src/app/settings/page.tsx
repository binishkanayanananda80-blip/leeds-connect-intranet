import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Bell, Lock, Palette, 
  Smartphone, Languages, Shield, HelpCircle,
  User, ArrowRight, Settings as SettingsIcon,
  ChevronRight, Sparkles, Monitor
} from 'lucide-react'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { role: true }
  })

  const settingGroups = [
    {
      title: 'Security & Privacy',
      icon: Lock,
      color: 'bg-blue-500',
      items: [
        { label: 'Password Management', desc: 'Update and strengthen your login credentials', icon: Shield },
        { label: 'Session Controls', desc: 'View and manage your active devices', icon: Smartphone },
      ]
    },
    {
      title: 'Aesthetics & View',
      icon: Palette,
      color: 'bg-primary',
      items: [
        { label: 'Theme Preferences', desc: 'Choose between Light, Dark, or System mode', icon: Monitor },
        { label: 'Interface Language', desc: 'Set your preferred working language', icon: Languages },
      ]
    },
    {
      title: 'Communication',
      icon: Bell,
      color: 'bg-emerald-500',
      items: [
        { label: 'Notification Settings', desc: 'Control which alerts you receive', icon: Bell },
      ]
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12">
      {/* ── HERO HEADER ── */}
      <header className="relative bg-white rounded-[3.5rem] p-8 sm:p-12 shadow-premium border border-gray-100 overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <UserAvatar 
              imageUrl={user?.image} 
              name={user?.name} 
              size="2xl" 
              className="ring-8 ring-primary/5 shadow-2xl"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-2xl shadow-xl border-4 border-white">
              <SettingsIcon className="w-5 h-5 animate-spin-slow" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <Sparkles className="w-4 h-4" /> Account Command Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight uppercase">
              Control your <span className="text-primary">Environment</span>
            </h1>
            <p className="text-gray-500 font-medium text-sm max-w-lg">
              Manage your personal details, security protocols, and visual preferences for the Leeds Connect ecosystem.
            </p>
          </div>

          <Link 
            href="/profile/edit"
            className="w-full md:w-auto px-8 py-4 bg-primary text-white rounded-[1.8rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            Edit Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ── SETTINGS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {settingGroups.map((group, idx) => (
          <div 
            key={group.title} 
            className="flex flex-col bg-white rounded-[3rem] p-4 shadow-soft border border-gray-50 hover:shadow-premium transition-all duration-500 group"
          >
            <div className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 ${group.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                <group.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">{group.title}</h2>
            </div>
            
            <div className="flex-1 space-y-2">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-4 p-5 rounded-[2rem] hover:bg-gray-50 transition-all text-left group/item relative overflow-hidden"
                >
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover/item:text-primary group-hover/item:bg-white transition-all shadow-sm">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[12px] font-black text-gray-900 uppercase tracking-tight">{item.label}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-200 group-hover/item:text-primary group-hover/item:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Support Card */}
        <div className="bg-gray-900 rounded-[3rem] p-10 relative overflow-hidden flex flex-col justify-between group min-h-[320px]">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
            <HelpCircle size={160} className="text-white" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-gold-leeds backdrop-blur-md">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight leading-tight text-white">Need Platform Assistance?</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Our technical command center is standing by to assist with security or account queries.
            </p>
          </div>

          <button className="relative z-10 w-full py-4 bg-gold-leeds text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-gold-leeds/90 hover:-translate-y-1 transition-all">
            Contact Help Desk
          </button>
        </div>
      </div>
      
      {/* Footer info */}
      <div className="text-center py-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          Leeds Connect Intranet · v2.0.4 · Powered by Luminous UI
        </p>
      </div>
    </div>
  )
}
