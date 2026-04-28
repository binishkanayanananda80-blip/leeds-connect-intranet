'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, FileText, Send, Eye, ShieldAlert, Trash2, Library } from 'lucide-react'
import { getPendingArticles, approveArticle, rejectArticle, publishContent, getPublishedContent, deleteContent } from './actions'
import { motion } from 'framer-motion'

export default function KnowledgeHubAdmin() {
  const [activeTab, setActiveTab] = useState<'queue' | 'publish' | 'manage'>('queue')

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">Knowledge Hub Governance</h1>
          <p className="text-sm text-gray-700 font-medium">Manage blog approvals and publish official content.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'queue' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Approval Queue
          </button>
          <button 
            onClick={() => setActiveTab('publish')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'publish' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Publish Content
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'manage' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Manage Published
          </button>
        </div>
      </div>

      {activeTab === 'queue' && <ApprovalQueue />}
      {activeTab === 'publish' && <PublishContent />}
      {activeTab === 'manage' && <ManagePublishedContent />}
    </div>
  )
}

function ApprovalQueue() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    const data = await getPendingArticles()
    setArticles(data)
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    await approveArticle(id)
    fetchArticles()
  }

  const handleReject = async (id: string) => {
    const notes = prompt("Enter rejection reason (optional):")
    if (notes !== null) {
      await rejectArticle(id, notes)
      fetchArticles()
    }
  }

  if (loading) return <div className="p-8 text-center"><span className="animate-pulse">Loading queue...</span></div>

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white">
      <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
        <ShieldAlert className="text-primary" /> Pending Blog Articles
      </h2>
      
      {articles.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No pending articles in the queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 gap-4 transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex-1">
                <h3 className="text-base font-black text-black">{article.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-600">
                  <span>Author: {article.author?.name || 'Unknown'}</span>
                  <span>Submitted: {new Date(article.createdAt).toLocaleDateString()}</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{article.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-3 bg-white text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-200 transition-colors tooltip-trigger" title="Preview">
                  <Eye size={18} />
                </button>
                <button onClick={() => handleApprove(article.id)} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-emerald-100">
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleReject(article.id)} className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-rose-100">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PublishContent() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: 'SOP',
    mainCategory: '',
    subCategory: '',
    audienceFlags: [] as string[]
  })
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState('')

  const CATEGORIES = ["Academic Staff", "Academic Operations", "Operations", "Corporate Leadership"]
  const CONTENT_TYPES = ["SOP", "POLICY", "RESOURCE", "ANNOUNCEMENT"]
  const MAIN_CATEGORIES = ["Academic", "Operations", "Academic Operations"]
  const DEPARTMENTS = ["Facilities Management", "Security", "Marketing", "Human Resources", "IT"]

  const handleAudienceChange = (cat: string) => {
    setFormData(prev => {
      const flags = prev.audienceFlags.includes(cat)
        ? prev.audienceFlags.filter(f => f !== cat)
        : [...prev.audienceFlags, cat]
      return { ...prev, audienceFlags: flags }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setMessage('')
    try {
      const fd = new FormData(formRef.current!)
      fd.append('audienceFlags', formData.audienceFlags.join(','))
      // ensure we send the required fields
      fd.set('title', formData.title)
      fd.set('content', formData.content)
      fd.set('contentType', formData.contentType)
      if (formData.mainCategory) fd.set('mainCategory', formData.mainCategory)
      if (formData.subCategory && formData.mainCategory === 'Operations') fd.set('subCategory', formData.subCategory)
      
      await publishContent(fd)
      setMessage('Content published successfully!')
      setFormData({ title: '', content: '', contentType: 'SOP', mainCategory: '', subCategory: '', audienceFlags: [] })
      formRef.current?.reset()
    } catch (err: any) {
      setMessage(`Error: ${err?.message || 'Failed to publish content.'}`)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white space-y-6">
      <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
        <Send className="text-primary" /> Publish Official Content
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Title</label>
          <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400" placeholder="Enter title..." />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Content Type</label>
          <select value={formData.contentType} onChange={e => setFormData({...formData, contentType: e.target.value})} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all">
            {CONTENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Type of Material</label>
          <select value={formData.mainCategory} onChange={e => setFormData({...formData, mainCategory: e.target.value, subCategory: ''})} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all">
            <option value="">Select Type...</option>
            {MAIN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {formData.mainCategory === 'Operations' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Department</label>
            <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all">
              <option value="">Select Department...</option>
              {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 ml-1">File Attachment (Optional)</label>
          <input type="file" name="file" accept=".pdf,.doc,.docx,.xlsx" className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-white transition-all cursor-pointer bg-[#f3f4f6] rounded-xl" />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Audience Permissions</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <label key={cat} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.audienceFlags.includes(cat) ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-primary/30'}`}>
                <input type="checkbox" checked={formData.audienceFlags.includes(cat)} onChange={() => handleAudienceChange(cat)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                <span className="text-xs font-bold text-gray-700">{cat}</span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 font-medium ml-1 mt-2">Note: Corporate Leadership always has visibility to all published content.</p>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 ml-1">Content Body</label>
          <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={6} className="w-full bg-[#f3f4f6] border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-gray-400 resize-y" placeholder="Write content here..." />
        </div>
      </div>

      {message && <div className="p-4 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold">{message}</div>}

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
        <button type="button" className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold uppercase tracking-wider text-xs transition-all">Save as Draft</button>
        <button type="submit" disabled={isPending} className="px-8 py-3 bg-primary hover:bg-primary/95 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
          {isPending ? 'Publishing...' : 'Publish Content'}
        </button>
      </div>
    </form>
  )
}

function ManagePublishedContent() {
  const [content, setContent] = useState<{ id: string, title: string, type: 'ARTICLE' | 'CONTENT_ITEM', date: Date, author: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setLoading(true)
    const data = await getPublishedContent()
    const combined = [...data.articles, ...data.contentItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setContent(combined)
    setLoading(false)
  }

  const handleDelete = async (id: string, type: 'ARTICLE' | 'CONTENT_ITEM') => {
    if (confirm("Are you sure you want to permanently delete this content? This action cannot be undone.")) {
      await deleteContent(id, type)
      fetchContent()
    }
  }

  if (loading) return <div className="p-8 text-center"><span className="animate-pulse">Loading content library...</span></div>

  return (
    <div className="bg-white rounded-[2.5rem] shadow-premium p-8 border border-white">
      <h2 className="text-lg font-black uppercase tracking-tight text-black mb-6 flex items-center gap-2">
        <Library className="text-primary" /> Live Content Library
      </h2>
      
      {content.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No published content found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {content.map(item => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 gap-4 transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex-1">
                <h3 className="text-base font-black text-black">{item.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-600">
                  <span>Author: {item.author || 'Unknown'}</span>
                  <span>Published: {new Date(item.date).toLocaleDateString()}</span>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.type === 'ARTICLE' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.type === 'ARTICLE' ? 'Blog Article' : 'Official Document'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(item.id, item.type)} className="flex items-center gap-2 px-4 py-3 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-rose-100">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
