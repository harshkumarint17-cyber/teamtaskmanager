'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Plus, Pencil, Trash2, Users, Calendar, FolderKanban } from 'lucide-react'

function ProjectModal({ project, users, onClose, onSave }) {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    deadline: project?.deadline ? project.deadline.split('T')[0] : '',
    status: project?.status || 'active',
    teamMembers: project?.teamMembers?.map(m => m._id || m) || []
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  function toggleMember(id) {
    setForm(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(id)
        ? prev.teamMembers.filter(m => m !== id)
        : [...prev.teamMembers, id]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-dp-surface rounded-2xl w-full max-w-lg p-6 border border-dp-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-violet-50 mb-5">
          {project ? 'Edit Project' : 'New Project'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Brief project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-violet-300 mb-2">Team Members</label>
            {users.length === 0 ? (
              <p className="text-sm text-violet-500 py-2">No users available</p>
            ) : (
              <div className="border border-dp-bstrong rounded-lg divide-y divide-dp-bsoft max-h-44 overflow-y-auto">
                {users.map(u => (
                  <label
                    key={u._id}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-dp-raised cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.teamMembers.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                      className="accent-violet-500"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-violet-200">{u.name}</span>
                      <span className="text-xs text-violet-500 ml-2 capitalize">{u.role}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-dp-bstrong rounded-lg text-sm font-medium text-violet-300 hover:bg-dp-raised transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProject, setEditProject] = useState(null)

  useEffect(() => {
    fetchProjects()
    if (user?.role === 'admin') fetchUsers()
  }, [user])

  async function fetchProjects() {
    try {
      const res = await api.get('/api/projects')
      setProjects(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get('/api/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSave(form) {
    try {
      if (editProject) {
        const res = await api.put(`/api/projects/${editProject._id}`, form)
        setProjects(prev => prev.map(p => p._id === editProject._id ? res.data : p))
      } else {
        const res = await api.post('/api/projects', form)
        setProjects(prev => [res.data, ...prev])
      }
      setShowModal(false)
      setEditProject(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving project')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this project? All its tasks will also be removed.')) return
    try {
      await api.delete(`/api/projects/${id}`)
      setProjects(prev => prev.filter(p => p._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project')
    }
  }

  function openCreate() {
    setEditProject(null)
    setShowModal(true)
  }

  function openEdit(project) {
    setEditProject(project)
    setShowModal(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-violet-50">Projects</h1>
            <p className="text-sm text-violet-400 mt-1">{projects.length} total</p>
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-violet-600">
            <FolderKanban size={44} className="mx-auto mb-3" />
            <p className="font-medium text-violet-500">No projects yet</p>
            {user?.role === 'admin' && (
              <p className="text-sm mt-1 text-violet-600">Create your first project to get started</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map(project => (
              <div
                key={project._id}
                className="bg-dp-surface rounded-xl border border-dp-border p-5 hover:border-dp-bstrong transition-all hover:shadow-[0_0_15px_rgba(109,40,217,0.15)] flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    href={`/projects/${project._id}`}
                    className="font-semibold text-violet-100 hover:text-violet-300 transition-colors line-clamp-1 flex-1 mr-2"
                  >
                    {project.title}
                  </Link>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'completed' ? 'bg-violet-500/20 text-violet-300' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-violet-400 line-clamp-2 mb-4 flex-1">
                  {project.description || 'No description provided'}
                </p>

                <div className="flex items-center gap-4 text-xs text-violet-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{project.teamMembers?.length || 0} members</span>
                  </div>
                  {project.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-dp-bsoft">
                  <Link
                    href={`/projects/${project._id}`}
                    className="flex-1 text-center text-sm text-violet-400 font-medium py-1.5 rounded-lg hover:bg-violet-600/10 transition-colors"
                  >
                    View Details
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => openEdit(project)}
                        className="p-1.5 text-violet-500 hover:text-violet-300 hover:bg-violet-600/10 rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="p-1.5 text-violet-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ProjectModal
          project={editProject}
          users={users}
          onClose={() => { setShowModal(false); setEditProject(null) }}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  )
}
