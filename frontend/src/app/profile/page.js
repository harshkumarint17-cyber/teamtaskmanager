'use client'

import { useState, useRef } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import { User, Mail, Shield, Phone, Pencil, Check, X, Briefcase } from 'lucide-react'

const DESIGNATIONS = ['member', 'intern', 'full-time', 'IT', 'HR', 'Founder', 'CoFounder', 'CTO']

const designationColors = {
  member: 'bg-gray-100 text-gray-600',
  intern: 'bg-orange-50 text-orange-600',
  'full-time': 'bg-blue-50 text-blue-600',
  IT: 'bg-cyan-50 text-cyan-600',
  HR: 'bg-pink-50 text-pink-600',
  Founder: 'bg-purple-50 text-purple-700',
  CoFounder: 'bg-violet-50 text-violet-700',
  CTO: 'bg-indigo-50 text-indigo-700',
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    personalEmail: user?.personalEmail || '',
    avatar: user?.avatar || '',
    designation: user?.designation || 'member'
  })

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm(prev => ({ ...prev, avatar: reader.result }))
    reader.readAsDataURL(file)
  }

  function startEdit() {
    setForm({
      name: user?.name || '',
      mobile: user?.mobile || '',
      personalEmail: user?.personalEmail || '',
      avatar: user?.avatar || '',
      designation: user?.designation || 'member'
    })
    setError('')
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setError('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await api.put('/api/users/profile', { name: form.name, mobile: form.mobile, personalEmail: form.personalEmail, avatar: form.avatar })
      updateUser(res.data)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = (editing ? form.avatar : user?.avatar) || ''
  const initials = user?.name?.charAt(0).toUpperCase()

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-violet-50">Profile</h1>
            <p className="text-sm text-violet-400 mt-1">Manage your personal information</p>
          </div>
          {!editing && (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 border border-dp-bstrong text-sm font-medium text-violet-300 px-4 py-2 rounded-lg hover:bg-dp-raised transition-colors"
            >
              <Pencil size={14} />
              Edit Profile
            </button>
          )}
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <Check size={15} />
            Profile updated successfully
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
          <div className="bg-gradient-to-r from-violet-900 to-purple-800 h-24" />

          <form onSubmit={handleSave}>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-6">
                <div className="relative">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="avatar"
                      className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-dp-raised border-4 border-dp-surface shadow-sm flex items-center justify-center text-violet-400 text-3xl font-bold">
                      {initials}
                    </div>
                  )}
                  {editing && (
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-violet-600 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-violet-700 transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="mb-1">
                  <p className="text-lg font-bold text-violet-50">{user?.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
                      user?.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-violet-500/20 text-violet-300'
                    }`}>
                      {user?.role}
                    </span>
                    {user?.designation && user.designation !== 'member' && (
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${designationColors[user.designation] || 'bg-white/10 text-violet-400'}`}>
                        {user.designation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                      <User size={12} />
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="text-sm font-medium text-violet-100 px-3 py-2 bg-dp-raised rounded-lg">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                      <Shield size={12} />
                      Account Email
                    </label>
                    <p className="text-sm font-medium text-violet-400 px-3 py-2 bg-dp-raised rounded-lg truncate">{user?.email}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} />
                      Mobile Number
                    </label>
                    {editing ? (
                      <input
                        value={form.mobile}
                        onChange={e => setForm({ ...form, mobile: e.target.value })}
                        className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="+91 98765 43210"
                        type="tel"
                      />
                    ) : (
                      <p className="text-sm font-medium text-violet-100 px-3 py-2 bg-dp-raised rounded-lg">
                        {user?.mobile || <span className="text-violet-600 italic">Not added</span>}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                      <Mail size={12} />
                      Personal Email
                    </label>
                    {editing ? (
                      <input
                        value={form.personalEmail}
                        onChange={e => setForm({ ...form, personalEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        placeholder="personal@gmail.com"
                        type="email"
                      />
                    ) : (
                      <p className="text-sm font-medium text-violet-100 px-3 py-2 bg-dp-raised rounded-lg truncate">
                        {user?.personalEmail || <span className="text-violet-600 italic">Not added</span>}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-violet-500 mb-1.5 flex items-center gap-1.5">
                      <Briefcase size={12} />
                      Designation
                    </label>
                    <p className="text-sm font-medium text-violet-100 px-3 py-2 bg-dp-raised rounded-lg">
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${designationColors[user?.designation] || 'bg-white/10 text-violet-400'}`}>
                        {user?.designation || 'member'}
                      </span>
                      <span className="text-xs text-violet-500 ml-2">Assigned by admin</span>
                    </p>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 border border-dp-bstrong rounded-lg text-sm font-medium text-violet-300 hover:bg-dp-raised transition-colors"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 px-5 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                    >
                      <Check size={14} />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className={`rounded-xl border p-5 ${
          user?.role === 'admin' ? 'bg-violet-600/10 border-violet-500/30' : 'bg-purple-600/10 border-purple-500/30'
        }`}>
          <p className={`text-sm font-semibold mb-1 ${
            user?.role === 'admin' ? 'text-violet-300' : 'text-purple-300'
          }`}>
            {user?.role === 'admin' ? 'Admin Access' : 'Member Access'}
          </p>
          <p className={`text-xs leading-relaxed ${
            user?.role === 'admin' ? 'text-violet-400' : 'text-purple-400'
          }`}>
            {user?.role === 'admin'
              ? 'You have full access to create projects, assign tasks, manage team members, and view the admin panel.'
              : 'You can view assigned projects, update your task statuses, and track your progress on the dashboard.'}
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
