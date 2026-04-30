'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, CheckCircle, Image as ImageIcon, Users, FileSpreadsheet, List, Plus, Search, Eye, Edit, UserX, UserCheck, Trash2, ShieldAlert, ChevronDown, KeyRound } from 'lucide-react'
import Papa from 'papaparse'
import { createEmployee, getBranches, getEmployeesByBranch, suspendEmployee, reactivateEmployee, deleteEmployee, getRoles, getEmployeeCategories, updateEmployeeImage, updateEmployee, getDepartments, getEmployeeSubCategories, resetEmployeePassword } from './actions'
import { UserAvatar } from '@/components/ui/UserAvatar'

export default function EmployeeAdminClient({ roleName }: { roleName: string }) {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list')
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const isAdmin = ['Super Admin', 'Corporate Admin'].includes(roleName)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Employee Management</h1>
          <p className="text-sm text-gray-700 font-medium">Manage staff profiles, directory, and access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('list')} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
              <List size={14} /> Employee List
            </button>
            <button onClick={() => setActiveTab('create')} className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'create' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}>
              <Plus size={14} /> Add Employee
            </button>
          </div>
          <button onClick={() => setShowBulkUpload(true)} className="flex items-center gap-2 px-5 py-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all">
            <FileSpreadsheet size={14} /> CSV Import
          </button>
        </div>
      </div>

      {activeTab === 'list' && <EmployeeListTab roleName={roleName} isAdmin={isAdmin} />}
      {activeTab === 'create' && (
        <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white">
          <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
            <Users className="text-primary" /> Individual Employee Creation
          </h2>
          <EmployeeForm roleName={roleName} />
        </div>
      )}

      {showBulkUpload && <BulkUploadModal onClose={() => setShowBulkUpload(false)} />}
    </div>
  )
}

// ── Employee List Tab ────────────────────────────────────────────────
function EmployeeListTab({ roleName, isAdmin }: { roleName: string, isAdmin: boolean }) {
  const [branches, setBranches] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewEmployee, setViewEmployee] = useState<any | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [resettingEmployee, setResettingEmployee] = useState<any | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !viewEmployee) return

    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const uploadData = await uploadRes.json()
      
      if (uploadData.url) {
        await updateEmployeeImage(viewEmployee.user.id, uploadData.url)
        // Update local state to reflect new image immediately
        setViewEmployee({ ...viewEmployee, user: { ...viewEmployee.user, image: uploadData.url } })
        load() // Refresh the list in the background
      }
    } catch (err) {
      console.error('Failed to upload image', err)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    const [branchData, empData] = await Promise.all([
      getBranches(),
      getEmployeesByBranch(selectedBranch)
    ])
    setBranches(branchData)
    setEmployees(empData)
    setLoading(false)
  }, [selectedBranch])

  useEffect(() => { load() }, [load])

  const filtered = employees.filter(e => {
    const fullName = `${e.firstName} ${e.lastName}`.toLowerCase()
    return !search || fullName.includes(search.toLowerCase()) || e.employeeNumber.toLowerCase().includes(search.toLowerCase())
  })

  const handleSuspend = async (userId: string) => {
    if (!confirm('Suspend this employee? They will not be able to log in.')) return
    await suspendEmployee(userId)
    load()
  }

  const handleReactivate = async (userId: string) => {
    await reactivateEmployee(userId)
    load()
  }

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`PERMANENTLY DELETE ${name}? This cannot be undone.`)) return
    await deleteEmployee(userId)
    load()
  }

  const handleResetPassword = async () => {
    if (!resettingEmployee) return
    setResetLoading(true)
    const res = await resetEmployeePassword(resettingEmployee.user.id)
    setResetLoading(false)
    if (res?.error) {
      alert(res.error)
    } else {
      setResetSuccess(true)
      setTimeout(() => {
        setResettingEmployee(null)
        setResetSuccess(false)
      }, 2000)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-primary/30 transition-all"
          >
            <option value="ALL">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filtered.length} employees</span>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or EMP ID..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading employees...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-bold text-sm">No employees found for this branch.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-black uppercase tracking-widest text-[10px]">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">EMP ID</th>
                <th className="p-4">Branch</th>
                <th className="p-4">Designation / Sub-Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => {
                const isActive = emp.user?.isActive !== false
                return (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar imageUrl={emp.user?.image} name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                        <div>
                          <p className="font-black text-black text-xs">{emp.firstName} {emp.middleName} {emp.lastName}</p>
                          <p className="text-[10px] text-gray-600 font-bold">{emp.mobileNumber || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-black text-gray-800">{emp.employeeNumber}</td>
                    <td className="p-4 font-medium text-gray-500">{emp.branch?.name || '—'}</td>
                    <td className="p-4 font-medium text-gray-500">
                      {emp.designation || emp.subCategory?.name || emp.category?.name || '—'}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setViewEmployee(emp)} title="View" className="p-2 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors border border-gray-100">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => setEditingEmployee(emp)} title="Edit" className="p-2 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors border border-gray-100">
                          <Edit size={14} />
                        </button>
                        {isActive ? (
                          <button onClick={() => handleSuspend(emp.user.id)} title="Suspend" className="p-2 bg-amber-50 text-amber-500 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100">
                            <UserX size={14} />
                          </button>
                        ) : (
                          <button onClick={() => handleReactivate(emp.user.id)} title="Reactivate" className="p-2 bg-emerald-50 text-emerald-500 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100">
                            <UserCheck size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => { setResettingEmployee(emp); setResetSuccess(false) }} title="Reset Password" className="p-2 bg-violet-50 text-violet-500 hover:bg-violet-500 hover:text-white rounded-xl transition-all border border-violet-100">
                            <KeyRound size={14} />
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => handleDelete(emp.user.id, `${emp.firstName} ${emp.lastName}`)} title="Delete" className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-100">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee View Modal */}
      <AnimatePresence>
        {viewEmployee && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewEmployee(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-lg z-10">
              <button onClick={() => setViewEmployee(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative group">
                  <UserAvatar imageUrl={viewEmployee.user?.image} name={`${viewEmployee.firstName} ${viewEmployee.lastName}`} size="2xl" />
                  <label className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    {uploadingImage ? (
                      <span className="text-white text-xs font-bold animate-pulse">Wait...</span>
                    ) : (
                      <div className="text-white flex flex-col items-center">
                        <Upload size={20} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  </label>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black leading-tight">{viewEmployee.firstName} {viewEmployee.middleName} {viewEmployee.lastName}</h3>
                  <p className="text-sm font-black uppercase text-primary tracking-widest mt-1">{viewEmployee.employeeNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Email', viewEmployee.user?.email],
                  ['Branch', viewEmployee.branch?.name],
                  ['System Role', viewEmployee.role?.name],
                  ['Category', viewEmployee.category?.name],
                  ['Sub-Category', viewEmployee.subCategory?.name],
                  ['Department', viewEmployee.department?.name],
                  ['Designation', viewEmployee.designation],
                  ['Mobile', viewEmployee.mobileNumber],
                  ['Land Phone', viewEmployee.landPhoneNumber],
                  ['NIC', viewEmployee.nicNumber],
                  ['Status', viewEmployee.user?.isActive !== false ? 'Active' : 'Suspended'],
                  ['Date of Birth', (() => {
                    try {
                      return viewEmployee.dateOfBirth ? new Date(viewEmployee.dateOfBirth).toLocaleDateString() : '—'
                    } catch { return '—' }
                  })()],
                  ['Date Joined', (() => {
                    try {
                      return viewEmployee.dateOfJoined ? new Date(viewEmployee.dateOfJoined).toLocaleDateString() : '—'
                    } catch { return '—' }
                  })()],
                ].map(([k, v, fullWidth]) => (
                  <div key={k as string} className={`bg-gray-50 p-3 rounded-2xl ${fullWidth ? 'col-span-2' : ''}`}>
                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">{k}</p>
                    <p className="font-bold text-black text-xs">{v || '—'}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Employee Edit Modal */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingEmployee(null)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-4xl z-10 max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditingEmployee(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors z-20">
                <X size={18} />
              </button>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mb-8">Edit Employee</h2>
              <EmployeeForm roleName={roleName} initialData={editingEmployee} onSuccess={() => { setEditingEmployee(null); load(); }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reset Password Confirmation Modal ── */}
      <AnimatePresence>
        {resettingEmployee && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !resetLoading && setResettingEmployee(null)} className="absolute inset-0 bg-black/50 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md z-10">
              {resetSuccess ? (
                <div className="flex flex-col items-center text-center py-4 gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Password Reset!</h3>
                  <p className="text-sm text-gray-500 font-medium">The employee will be prompted to change their password on next login.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0">
                      <KeyRound size={24} className="text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">Reset Password</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Admin Action</p>
                    </div>
                  </div>
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 mb-6">
                    <p className="text-sm font-bold text-violet-900">
                      You are about to reset the password for:
                    </p>
                    <p className="text-lg font-black text-violet-700 mt-1">{resettingEmployee.firstName} {resettingEmployee.lastName}</p>
                    <p className="text-xs font-bold text-violet-500 uppercase tracking-widest">{resettingEmployee.employeeNumber}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
                    <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">⚠️ What will happen</p>
                    <ul className="text-xs text-amber-700 font-medium space-y-1 list-disc list-inside">
                      <li>Password will be reset to <span className="font-black">password123</span></li>
                      <li>Employee must change password on next login</li>
                      <li>This action will be recorded in the audit log</li>
                    </ul>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setResettingEmployee(null)} disabled={resetLoading} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50">
                      Cancel
                    </button>
                    <button onClick={handleResetPassword} disabled={resetLoading} className="flex-1 py-3 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50">
                      {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Employee Form ────────────────────────────────────────────────────
function EmployeeForm({ roleName, initialData, onSuccess }: { roleName: string, initialData?: any, onSuccess?: () => void }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState<string | null>(initialData?.user?.image || null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    mobileNumber: initialData?.mobileNumber || '',
    landPhoneNumber: initialData?.landPhoneNumber || '',
    nicNumber: initialData?.nicNumber || '',
    dateOfBirth: (() => {
      try {
        return initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : ''
      } catch { return '' }
    })(),
    dateOfJoined: (() => {
      try {
        return initialData?.dateOfJoined ? new Date(initialData.dateOfJoined).toISOString().split('T')[0] : ''
      } catch { return '' }
    })(),
    employeeNumber: initialData?.employeeNumber || '',
    branchId: initialData?.branchId || '',
    roleId: initialData?.roleId || '',
    categoryId: initialData?.categoryId || '',
    subCategoryId: initialData?.subCategoryId || '',
    departmentId: initialData?.departmentId || '',
    designation: initialData?.designation || ''
  })

  useEffect(() => {
    Promise.all([getBranches(), getRoles(), getEmployeeCategories(), getDepartments()]).then(([b, r, c, d]) => {
      setBranches(b); setRoles(r); setCategories(c); setDepartments(d)
    })
  }, [])

  useEffect(() => {
    if (formData.categoryId) {
      // Find the name of the selected category to apply filtering logic
      const selectedCategoryName = categories.find(c => c.id === formData.categoryId)?.name

      getEmployeeSubCategories(formData.categoryId).then(data => {
        let allowed: string[] = []
        
        switch (selectedCategoryName) {
          case 'Operations':
            allowed = ['Operations Leadership', 'Operations Staff']
            break
          case 'Academic Operations':
            allowed = ['Academic Operations Leadership', 'Academic Operations Staff']
            break
          case 'Academic':
            allowed = ['Academic Leadership', 'Academic Staff']
            break
          case 'Corporate Leadership':
            allowed = ['Founder', 'Chairperson', 'Managing Director', 'Directress']
            break
          default:
            allowed = []
        }

        setSubCategories(data.filter(sc => allowed.includes(sc.name)))
      })
    } else {
      setSubCategories([])
      setFormData(prev => ({ ...prev, subCategoryId: '' }))
    }
  }, [formData.categoryId, categories])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true); setError(''); setMessage('')
    try {
      // Upload image first if selected
      let imageUrl: string | undefined = undefined
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const uploadRes = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (uploadData.url) imageUrl = uploadData.url
      }

      let res;
      if (initialData) {
        res = await updateEmployee(initialData.user.id, {
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          dateOfJoined: formData.dateOfJoined ? new Date(formData.dateOfJoined) : undefined,
          imageUrl: imageUrl,
        })
      } else {
        res = await createEmployee({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          dateOfJoined: formData.dateOfJoined ? new Date(formData.dateOfJoined) : undefined,
          imageUrl: imageUrl,
        })
      }
      
      if (res.error) {
        setError(res.error)
      } else {
        setMessage(initialData ? `✅ Employee updated successfully!` : `✅ Employee created successfully! EMP No: ${res.employeeNumber}`)
        if (!initialData) {
          setFormData({ firstName: '', middleName: '', lastName: '', mobileNumber: '', landPhoneNumber: '', nicNumber: '', dateOfBirth: '', dateOfJoined: '', employeeNumber: '', branchId: '', roleId: '', categoryId: '', subCategoryId: '', departmentId: '', designation: '' })
          setPhoto(null)
          setImageFile(null)
        }
        if (onSuccess) onSuccess()
      }
    } catch (err) { setError('An unexpected error occurred.') }
    finally { setIsPending(false) }
  }

  const ALLOWED_ROLES = ['Super Admin', 'Module Admin', 'Moderator', 'End User']
  const visibleRoles = roles.filter(r =>
    ALLOWED_ROLES.includes(r.name) &&
    (r.name !== 'Super Admin' || roleName === 'Super Admin')
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-gray-100 pb-2">Section A — Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
          <Input label="Middle Name (Optional)" name="middleName" value={formData.middleName} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-gray-100 pb-2">Section B — Contact & Identity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} />
          <Input label="Land Phone Number" name="landPhoneNumber" value={formData.landPhoneNumber} onChange={handleChange} />
          <Input label="NIC Number" name="nicNumber" value={formData.nicNumber} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-gray-100 pb-2">Section C — Employment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
          <Input label="Date of Joined" name="dateOfJoined" type="date" value={formData.dateOfJoined} onChange={handleChange} />
          <Input label="Employee Number (EMP No.)" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} required />
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-800 ml-1">Branch</label>
            <select name="branchId" value={formData.branchId} onChange={handleChange} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-black">
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">System Role</label>
            <select name="roleId" value={formData.roleId} onChange={handleChange} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-gray-900">
              <option value="">Select System Role</option>
              {visibleRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Employee Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-gray-900">
              <option value="">Select Employee Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Sub Category</label>
            <select name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} disabled={!formData.categoryId} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-gray-900 disabled:opacity-50">
              <option value="">Select Sub Category</option>
              {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Department</label>
            <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all text-gray-900">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <Input label="Designation" name="designation" value={formData.designation} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-gray-100 pb-2">Section D — Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
            {photo ? <img src={photo} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={32} />}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0]
              if (!file) return
              setPhoto(URL.createObjectURL(file))
              setImageFile(file)
            }}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-white transition-all cursor-pointer"
          />
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-xl text-sm font-bold">{error}</div>}
      {message && <div className="text-green-700 bg-green-50 p-4 rounded-xl text-sm font-bold border border-green-100">{message}</div>}

      <div className="pt-4 border-t border-gray-100">
        <button type="submit" disabled={isPending} className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
          {isPending ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Employee' : 'Create Employee')}
        </button>
      </div>
    </form>
  )
}

// ── Bulk Upload Modal (unchanged) ──────────────────────────────────
function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const [data, setData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) Papa.parse(file, { header: true, complete: (r) => { setHeaders(r.meta.fields || []); setData(r.data) } })
  }
  const downloadTemplate = () => {
    const csv = Papa.unparse([['First Name','Middle Name','Last Name','Mobile Number','Land Phone Number','NIC Number','Date of Birth','Date of Joined','Employee Number','Branch','System Role','Employee Category']])
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'leeds_employee_template.csv'; a.click()
  }
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div><h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Bulk Employee Upload</h2><p className="text-sm text-gray-500 font-medium">Upload a CSV matching the exact template columns.</p></div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={24} /></button>
        </div>
        {!data.length ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <span className="text-sm font-medium text-blue-900">Step 1: Download the exact template required for upload.</span>
              <button onClick={downloadTemplate} className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-100 transition-all">Download CSV</button>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-primary/50 transition-colors bg-gray-50/50">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm font-bold text-gray-700 mb-2">Drag and drop your completed CSV file here</p>
              <p className="text-xs text-gray-400 mb-6">or click below to browse your files</p>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csv-upload" />
              <label htmlFor="csv-upload" className="inline-block px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-primary/95 transition-all shadow-md shadow-primary/20">Select CSV File</label>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl border border-green-100 flex items-center gap-2 font-medium text-sm"><CheckCircle size={18} /> Found {data.length} records. Please review before importing.</div>
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider"><tr>{headers.map(h => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-gray-100">{data.slice(0, 10).map((row, i) => <tr key={i} className="hover:bg-gray-50/50">{headers.map(h => <td key={h} className="p-3 whitespace-nowrap font-medium text-gray-700">{row[h]}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setData([])} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider">Cancel</button>
              <button className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">Confirm & Import</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-800 ml-1">{label}</label>
      <input className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-black" {...props} />
    </div>
  )
}
