'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Users, Shield, FolderKanban, CheckSquare, Trash2, Crown } from 'lucide-react'

const DESIGNATIONS = ['member', 'intern', 'full-time', 'IT', 'HR', 'Founder', 'CoFounder', 'CTO']
const ROLES = ['admin', 'member']

const designationColors = {
  member: 'bg-white/10 text-violet-400',
  intern: 'bg-orange-500/20 text-orange-400',
  'full-time': 'bg-blue-500/20 text-blue-400',
  IT: 'bg-cyan-500/20 text-cyan-400',
  HR: 'bg-pink-500/20 text-pink-400',
  Founder: 'bg-purple-500/20 text-purple-300',
  CoFounder: 'bg-violet-500/20 text-violet-300',
  CTO: 'bg-indigo-500/20 text-indigo-300',
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const isSuperAdmin = user?.email === 'outreach@ethara.ai'

  useEffect(() => {
    if (!authLoading && user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role === 'admin') fetchData()
  }, [user])

  async function fetchData() {
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/projects'),
        api.get('/api/tasks')
      ])
      setUsers(usersRes.data)
      setProjects(projectsRes.data)
      setTasks(tasksRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      const res = await api.patch(`/api/users/${userId}/role`, { role })
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role')
    }
  }

  async function handleDesignationChange(userId, designation) {
    try {
      const res = await api.patch(`/api/users/${userId}/designation`, { designation })
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update designation')
    }
  }

  async function handleDeleteUser(userId, name) {
    if (!confirm(`Remove ${name} from the system? This cannot be undone.`)) return
    try {
      await api.delete(`/api/users/${userId}`)
      setUsers(prev => prev.filter(u => u._id !== userId))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove user')
    }
  }

  const admins = users.filter(u => u.role === 'admin')
  const overviewStats = [
    { label: 'Total Users', value: users.length, icon: Users, bg: 'bg-violet-600/20', color: 'text-violet-400' },
    { label: 'Admins', value: admins.length, icon: Shield, bg: 'bg-purple-600/20', color: 'text-purple-400' },
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, bg: 'bg-green-500/20', color: 'text-green-400' },
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, bg: 'bg-yellow-500/20', color: 'text-yellow-400' },
  ]

  if (authLoading || (user?.role === 'admin' && loading)) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-violet-50">Admin Panel</h1>
              {isSuperAdmin && (
                <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  <Crown size={11} />
                  Super Admin
                </span>
              )}
            </div>
            <p className="text-sm text-violet-400 mt-1">
              {isSuperAdmin ? 'Full system control — manage users, roles, and designations' : 'System overview and project management'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-dp-surface rounded-xl border border-dp-border p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-violet-400">{stat.label}</p>
                    <p className="text-3xl font-bold text-violet-50 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <Icon size={22} className={stat.color} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {isSuperAdmin ? (
          <div className="bg-dp-surface rounded-xl border border-amber-500/30 overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-500/20 flex items-center justify-between bg-amber-500/5">
              <div className="flex items-center gap-2">
                <Crown size={15} className="text-amber-600" />
                <h2 className="font-semibold text-amber-400">User Management</h2>
              </div>
              <span className="text-xs text-amber-500/70">{users.length} users</span>
            </div>

            {users.length === 0 ? (
              <div className="py-12 text-center text-violet-600 text-sm">No users yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dp-border bg-dp-raised">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-violet-400">User</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-violet-400">Access Role</th>
                      <th className="text-left px-3 py-3 text-xs font-semibold text-violet-400">Designation</th>
                      <th className="px-3 py-3 text-xs font-semibold text-violet-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dp-bsoft">
                    {users.map(u => {
                      const isSelf = u.email === 'outreach@ethara.ai'
                      return (
                        <tr key={u._id} className={`hover:bg-dp-raised transition-colors ${isSelf ? 'bg-amber-500/5' : ''}`}>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              {u.avatar ? (
                                <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="font-medium text-violet-100 truncate max-w-[120px]">{u.name}</p>
                                  {isSelf && <Crown size={11} className="text-amber-500 shrink-0" />}
                                </div>
                                <p className="text-xs text-violet-500 truncate max-w-[140px]">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            {isSelf ? (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">super admin</span>
                            ) : (
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u._id, e.target.value)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                                  u.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                                }`}
                              >
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            )}
                          </td>
                          <td className="px-3 py-3.5">
                            {isSelf ? (
                              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-medium">Founder</span>
                            ) : (
                              <select
                                value={u.designation || 'member'}
                                onChange={e => handleDesignationChange(u._id, e.target.value)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium focus:outline-none cursor-pointer bg-dp-raised border-dp-bstrong text-violet-200`}
                              >
                                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            )}
                          </td>
                          <td className="px-3 py-3.5 text-center">
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-violet-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remove user"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
            <div className="px-5 py-4 border-b border-dp-bsoft flex items-center justify-between">
              <h2 className="font-semibold text-violet-100">All Users</h2>
              <span className="text-xs text-violet-500">{users.length} total</span>
            </div>
            {users.length === 0 ? (
              <div className="py-12 text-center text-violet-600 text-sm">No users yet</div>
            ) : (
              <div className="divide-y divide-dp-bsoft">
                {users.map(u => (
                  <div key={u._id} className="px-5 py-4 flex items-center gap-4">
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-violet-100 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-violet-500 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${designationColors[u.designation] || 'bg-white/10 text-violet-400'}`}>
                      {u.designation || 'member'}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-violet-500/20 text-violet-300'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
            <div className="px-5 py-4 border-b border-dp-bsoft">
              <h2 className="font-semibold text-violet-100">Recent Projects</h2>
            </div>
            {projects.length === 0 ? (
              <div className="py-10 text-center text-violet-600 text-sm">No projects yet</div>
            ) : (
              <div className="divide-y divide-dp-bsoft">
                {projects.slice(0, 5).map(p => (
                  <div key={p._id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-violet-100 truncate">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      p.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      p.status === 'completed' ? 'bg-violet-500/20 text-violet-300' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
            <div className="px-5 py-4 border-b border-dp-bsoft">
              <h2 className="font-semibold text-violet-100">Task Summary</h2>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: 'Todo', count: tasks.filter(t => t.status === 'todo').length, color: 'bg-violet-500' },
                { label: 'In Progress', count: tasks.filter(t => t.status === 'in-progress').length, color: 'bg-purple-500' },
                { label: 'Done', count: tasks.filter(t => t.status === 'done').length, color: 'bg-green-500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                  <span className="text-sm text-violet-300 flex-1">{item.label}</span>
                  <span className="text-sm font-semibold text-violet-100">{item.count}</span>
                  <div className="w-24 h-1.5 bg-dp-high rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${item.color}`}
                      style={{ width: tasks.length > 0 ? `${Math.round((item.count / tasks.length) * 100)}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
