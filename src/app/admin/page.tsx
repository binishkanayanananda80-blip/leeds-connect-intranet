import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, BookOpen, ChevronRight, Shield } from 'lucide-react'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const roleName = (session.user as any)?.roleName || ''
  const isAuthorized = ['Super Admin', 'Corporate Admin', 'Module Admin', 'Moderator'].includes(roleName)
  const isAdmin = ['Super Admin', 'Corporate Admin'].includes(roleName)
  
  if (!isAuthorized) redirect('/intranet')

  const adminModules = [
    {
      title: 'Employee Management',
      description: 'Manage staff profiles, organizational structure, and bulk enrollments.',
      href: '/admin/employee',
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'Knowledge Governance',
      description: 'Approve incoming articles and publish official institutional documents.',
      href: '/admin/knowledge-hub',
      icon: BookOpen,
      color: 'text-gold-leeds',
      bg: 'bg-gold-leeds/10',
      adminOnly: false
    },
    {
      title: 'Audit Log',
      description: 'Full security audit trail of all administrative actions across the system.',
      href: '/admin/audit-log',
      icon: Shield,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      adminOnly: true
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-8 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black">
            Intranet <span className="text-primary">Admin Panel</span>
          </h1>
          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">
            Institutional Control Hub
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {adminModules.filter(mod => !mod.adminOnly || isAdmin).map((mod) => (
            <Link 
              key={mod.href}
              href={mod.href}
              className="bg-white p-8 rounded-[2.5rem] shadow-soft border border-gray-100 hover:shadow-premium hover:border-primary/20 transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${mod.bg} ${mod.color}`}>
                  <mod.icon className="w-8 h-8" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <h2 className="text-xl font-black text-black uppercase tracking-tight group-hover:text-primary transition-colors">
                  {mod.title}
                </h2>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">
                  {mod.description}
                </p>
              </div>

              {/* Decorative accent */}
              <div className={`absolute -bottom-24 -right-24 w-48 h-48 rounded-full ${mod.bg} opacity-0 group-hover:opacity-50 transition-opacity blur-3xl`} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
