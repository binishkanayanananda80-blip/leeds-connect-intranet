'use client'

import { useActionState, useState, useEffect } from 'react'
import Image from 'next/image'
import { authenticate, requestPasswordReset, verifyOtp, resetPassword } from './actions'
import { Eye, EyeOff, ChevronRight, HelpCircle, User, MapPin, IdCard, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type Stage = 'login' | 'forgot-request' | 'forgot-verify' | 'forgot-reset'

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )
  const [stage, setStage] = useState<Stage>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(false)
  
  // Reset States
  const [resetId, setResetId] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [isResetPending, setIsResetPending] = useState(false)

  // Debounce logic for Employee ID to fetch name and branch
  useEffect(() => {
    if (!employeeId || employeeId.trim() === '') {
      setEmployeeName('')
      setBranchName('')
      return
    }

    const timer = setTimeout(async () => {
      setIsFetchingEmployee(true)
      try {
        const res = await fetch(`/api/employee?id=${encodeURIComponent(employeeId)}`)
        if (res.ok) {
          const data = await res.json()
          setEmployeeName(data.name)
          setBranchName(data.branch)
        } else {
          setEmployeeName('')
          setBranchName('')
        }
      } catch (err) {
        setEmployeeName('')
        setBranchName('')
      } finally {
        setIsFetchingEmployee(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [employeeId])

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetPending(true)
    setResetError('')
    const res = await requestPasswordReset(resetId)
    if (res.success) {
      toast.success(res.message || 'A verification code has been sent.')
      setStage('forgot-verify')
    } else {
      setResetError(res.error || 'Something went wrong')
    }
    setIsResetPending(false)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetPending(true)
    setResetError('')
    const res = await verifyOtp(resetId, otp)
    if (res.success) {
      setStage('forgot-reset')
    } else {
      setResetError(res.error || 'Invalid OTP')
    }
    setIsResetPending(false)
  }

  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match')
      return
    }
    setIsResetPending(true)
    setResetError('')
    const res = await resetPassword(resetId, otp, newPassword)
    if (res.success) {
      toast.success('Password changed successfully. Please login.')
      setStage('login')
      setEmployeeId(resetId)
    } else {
      setResetError(res.error || 'Reset failed')
    }
    setIsResetPending(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* ── LEFT PANEL: BRANDING (Purple) ── */}
      <div className="hidden md:flex flex-1 bg-primary relative items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center mb-12"
          >
            <div className="w-48 h-48 mb-8 flex items-center justify-center bg-white rounded-[3rem] shadow-2xl p-2">
              <Image src="/logo.png" alt="Leeds Logo" width={180} height={180} className="object-contain" />
            </div>
            
            <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-2 uppercase">Leeds Connect</h1>
            <p className="text-xl font-medium text-white/80">Leeds International School</p>
            <p className="text-sm font-bold text-white/40 uppercase tracking-[0.3em] mt-3 italic">Staff Intranet Portal</p>
          </motion.div>

          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 text-left w-full max-w-xs mx-auto"
          >
            {[
              "School-wide announcements",
              "Staff directory and leadership profiles",
              "Birthday wall and celebrations",
              "Knowledge hub and welfare resources"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-white/90 text-sm font-medium group">
                <span className="w-2 h-2 rounded-full bg-gold-leeds shadow-[0_0_10px_rgba(169,139,68,0.5)] group-hover:scale-125 transition-transform" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* ── RIGHT PANEL: INTERACTIVE STAGES ── */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-20 bg-white">
        <div className="w-full max-w-md overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* 1. LOGIN STAGE */}
            {stage === 'login' && (
              <motion.div key="login" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="md:hidden text-center mb-10">
                  <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl border border-gray-100">
                    <Image src="/logo.png" alt="Leeds Logo" width={50} height={50} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">Leeds Connect</h1>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Staff Intranet Portal</p>
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">Employee Login</h2>
                  <p className="text-gray-500 font-medium">Sign in to access the staff intranet</p>
                </div>

                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Employee ID</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><IdCard size={18} /></div>
                      <input name="employeeNo" type="text" required value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="e.g. EMP001" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black outline-none transition-all placeholder:text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></div>
                      <input type="text" value={employeeName} readOnly placeholder="Auto-populated" className="w-full bg-primary/5 border-2 border-transparent rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black/70 outline-none transition-all cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Branch</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><MapPin size={18} /></div>
                      <input type="text" value={branchName} readOnly placeholder="Auto-populated" className="w-full bg-primary/5 border-2 border-transparent rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black/70 outline-none transition-all cursor-not-allowed" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-black/60">Password</label>
                      <button type="button" onClick={() => setStage('forgot-request')} className="text-[10px] font-black text-primary hover:underline transition-colors uppercase tracking-widest">Forgot password?</button>
                    </div>
                    <div className="relative">
                      <input name="password" type={showPassword ? 'text' : 'password'} required placeholder="Enter your password" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-6 py-4 text-sm font-bold text-black outline-none transition-all placeholder:text-gray-400" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-2xl px-4 py-3 flex items-center gap-3 uppercase tracking-widest"><HelpCircle size={16} /><p>{errorMessage}</p></div>
                  )}

                  <button type="submit" disabled={isPending} className={cn("w-full bg-primary hover:bg-primary/95 text-white font-black py-5 px-6 rounded-2xl transition-all duration-300 mt-4 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 active:scale-[0.98]", isPending && "opacity-70 cursor-not-allowed")}>
                    {isPending ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ChevronRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 2. FORGOT REQUEST STAGE */}
            {stage === 'forgot-request' && (
              <motion.div key="forgot-request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <button onClick={() => setStage('login')} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16} /> Back to Login</button>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">Reset Password</h2>
                  <p className="text-gray-500 font-medium">Enter your Employee ID to receive a verification code.</p>
                </div>
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Employee ID</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><IdCard size={18} /></div>
                      <input type="text" required value={resetId} onChange={(e) => setResetId(e.target.value)} placeholder="e.g. EMP001" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black outline-none transition-all placeholder:text-gray-400" />
                    </div>
                  </div>
                  {resetError && <p className="text-xs text-red-500 font-bold ml-1">{resetError}</p>}
                  <button type="submit" disabled={isResetPending} className="w-full bg-primary text-white font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                    {isResetPending ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Verification Code <ChevronRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* 3. FORGOT VERIFY STAGE */}
            {stage === 'forgot-verify' && (
              <motion.div key="forgot-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <button onClick={() => setStage('forgot-request')} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16} /> Change ID</button>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">Verify OTP</h2>
                  <p className="text-gray-500 font-medium">A secure code has been sent to the Administration. Please contact a Supervisor or Admin to receive your code.</p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">6-Digit Code</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><ShieldCheck size={18} /></div>
                      <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-2xl font-black tracking-[0.5em] text-black outline-none transition-all placeholder:text-gray-300 text-center" />
                    </div>
                  </div>
                  {resetError && <p className="text-xs text-red-500 font-bold ml-1">{resetError}</p>}
                  <button type="submit" disabled={isResetPending} className="w-full bg-primary text-white font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                    {isResetPending ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Code <ChevronRight size={18} /></>}
                  </button>
                  <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Didn't get the code? <button type="button" onClick={handleRequestReset} className="text-primary hover:underline">Resend</button></p>
                </form>
              </motion.div>
            )}

            {/* 4. FORGOT RESET STAGE */}
            {stage === 'forgot-reset' && (
              <motion.div key="forgot-reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">New Password</h2>
                  <p className="text-gray-500 font-medium">Create a strong password to secure your account.</p>
                </div>
                <form onSubmit={handleFinalReset} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">New Password</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><KeyRound size={18} /></div>
                      <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/60 ml-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"><KeyRound size={18} /></div>
                      <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#F4F4F5] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl pl-16 pr-6 py-4 text-sm font-bold text-black outline-none transition-all" />
                    </div>
                  </div>
                  {resetError && <p className="text-xs text-red-500 font-bold ml-1">{resetError}</p>}
                  <button type="submit" disabled={isResetPending} className="w-full bg-primary text-white font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-xl">
                    {isResetPending ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <ChevronRight size={18} /></>}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>

          <div className="text-center pt-8 border-t border-gray-50 mt-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
              Having trouble? Contact <a href="mailto:hr@leeds.edu" className="text-primary hover:underline transition-colors">hr@leeds.edu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
