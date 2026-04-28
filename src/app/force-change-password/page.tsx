'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShieldAlert, Lock, CheckCircle2, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import { updateForcePassword } from './actions'

export default function ForceChangePasswordPage() {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [isPending, startTransition] = useTransition()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter and one number.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    const fd = new FormData()
    fd.set('newPassword', newPassword)
    fd.set('confirmPassword', confirmPassword)

    startTransition(async () => {
      const result = await updateForcePassword(fd)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        // Update the JWT session so forcePasswordChange flag is cleared
        await updateSession({ forcePasswordChange: false })
        setTimeout(() => {
          router.replace('/')
          router.refresh()
        }, 2000)
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-premium p-12 border border-gray-100 relative overflow-hidden">

        {/* Success State */}
        {success ? (
          <div className="flex flex-col items-center text-center space-y-6 py-6">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-100">
              <ShieldCheck size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-tight">
                Password <span className="text-emerald-500">Updated</span> Successfully
              </h1>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Your credentials have been secured. Redirecting you to the dashboard…
              </p>
            </div>
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Cinematic Header */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary shadow-inner border border-primary/10">
                <ShieldAlert size={40} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-black text-black uppercase tracking-tight leading-tight">
                  Identity <span className="text-primary">Update</span> Required
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Institutional Security Policy Enforcement
                </p>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent" />

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                The Leeds Command Center requires a mandatory credential update for your identity. This ensures all mission-critical citadels remain secure.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-10 space-y-4">
              <div className="space-y-4">
                {/* New Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="New Access Password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-slate-500">
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300">
                    <CheckCircle2 size={18} />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm Access Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-300 hover:text-slate-500">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Requirements Indicator */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 mt-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-2">Requirements</h4>
                <div className="space-y-1.5 flex flex-col">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={newPassword.length >= 8 ? "text-green-500" : "text-gray-300"} />
                    <span className={newPassword.length >= 8 ? "text-gray-700 text-xs font-medium" : "text-gray-400 text-xs"}>Minimum 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-gray-300"} />
                    <span className={/[A-Z]/.test(newPassword) ? "text-gray-700 text-xs font-medium" : "text-gray-400 text-xs"}>At least one uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className={/[0-9]/.test(newPassword) ? "text-green-500" : "text-gray-300"} />
                    <span className={/[0-9]/.test(newPassword) ? "text-gray-700 text-xs font-medium" : "text-gray-400 text-xs"}>At least one number</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-xs font-semibold text-red-600">
                  <ShieldAlert size={14} className="shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:scale-100"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Update Identity Credentials <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          </>
        )}

        {/* Security watermark */}
        <div className="absolute -top-10 -right-10 opacity-[0.03] text-primary rotate-12 pointer-events-none">
          <ShieldAlert size={280} />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 opacity-40">
        <Image src="/logo.png" alt="Leeds" width={32} height={32} className="grayscale" />
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Access Only</p>
      </div>
    </div>
  )
}
