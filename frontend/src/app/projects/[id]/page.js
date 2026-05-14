'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Plus, Pencil, Trash2, Calendar, Users, ArrowLeft } from 'lucide-react'

const statusStyles = {
  todo: 'bg-white/10 text-violet-400',
  'in-progress': 'bg-violet-500/20 text-violet-300',
  done: 'bg-green-500/20 text-green-400'
}

const priorityStyles = {
  low: 'bg-white/10 text-violet-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400'
}

function TaskModal({ task, users, projectId, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    projectId
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-dp-surface rounded-2xl w-full max-w-md p-6 border border-dp-border">
        <h2 className="text-lg font-bold text-violet-50 mb-5">
          {task ? 'Edit Task' : 'New Task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">Title</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 placeholder:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Assign To</label>
              <select
                value={form.assignedTo}
                onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-300 mb-1">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-dp-bg border border-dp-bstrong rounded-lg text-sm text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
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
              {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [projRes, taskRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/tasks?projectId=${id}`)
      ])
      setProject(projRes.data)
      setTasks(taskRes.data)
      if (user?.role === 'admin') {
        const usersRes = await api.get('/api/users')
        setUsers(usersRes.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveTask(form) {
    try {
      if (editTask) {
        const res = await api.put(`/api/tasks/${editTask._id}`, form)
        setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t))
      } else {
        const res = await api.post('/api/tasks', form)
        setTasks(prev => [res.data, ...prev])
      }
      setShowModal(false)
      setEditTask(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving task')
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
      setTasks(prev => prev.filter(t => t._id !== taskId))
    } catch (err) {
      alert('Error deleting task')
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      const res = await api.put(`/api/tasks/${taskId}`, { status })
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      </DashboardLayout>
    )
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-violet-500">Project not found</div>
      </DashboardLayout>
    )
  }

  const now = new Date()
  const done = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-violet-500 hover:text-violet-300 mb-4 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-violet-50">{project.title}</h1>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  project.status === 'completed' ? 'bg-violet-500/20 text-violet-300' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {project.status}
                </span>
              </div>
              {project.description && (
                <p className="text-violet-400 text-sm mt-1">{project.description}</p>
              )}
            </div>
            {user?.role === 'admin' && (
              <button
                onClick={() => { setEditTask(null); setShowModal(true) }}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors shrink-0"
              >
                <Plus size={16} />
                Add Task
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-dp-surface rounded-xl border border-dp-border p-4">
            <div className="flex items-center gap-2 mb-2 text-violet-500">
              <Calendar size={14} />
              <span className="text-xs font-medium">Deadline</span>
            </div>
            <p className="font-semibold text-violet-100 text-sm">
              {project.deadline
                ? new Date(project.deadline).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                : 'No deadline set'}
            </p>
          </div>

          <div className="bg-dp-surface rounded-xl border border-dp-border p-4">
            <div className="flex items-center gap-2 mb-2 text-violet-500">
              <Users size={14} />
              <span className="text-xs font-medium">Team</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {project.teamMembers?.length > 0 ? (
                <>
                  {project.teamMembers.slice(0, 5).map(m => (
                    <div
                      key={m._id}
                      title={m.name}
                      className="w-7 h-7 rounded-full bg-violet-600/30 flex items-center justify-center text-violet-300 text-xs font-semibold"
                    >
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.teamMembers.length > 5 && (
                    <span className="text-xs text-violet-500">+{project.teamMembers.length - 5}</span>
                  )}
                </>
              ) : (
                <span className="text-sm text-violet-500">No members added</span>
              )}
            </div>
          </div>

          <div className="bg-dp-surface rounded-xl border border-dp-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-violet-500">Progress</span>
              <span className="text-sm font-bold text-violet-100">{progress}%</span>
            </div>
            <div className="h-2 bg-dp-high rounded-full">
              <div
                className="h-2 bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-violet-500 mt-1.5">{done} of {tasks.length} tasks done</p>
          </div>
        </div>

        <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
          <div className="px-5 py-4 border-b border-dp-bsoft">
            <h2 className="font-semibold text-violet-100">Tasks ({tasks.length})</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="py-16 text-center text-violet-600">
              <p>No tasks yet</p>
              {user?.role === 'admin' && (
                <p className="text-xs mt-1 text-violet-600">Click &quot;Add Task&quot; to create one</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-dp-bsoft">
              {tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
                return (
                  <div key={task._id} className="px-5 py-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-violet-100 text-sm">{task.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                        {isOverdue && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-violet-500 mt-0.5">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-violet-500 flex-wrap">
                        {task.assignedTo && (
                          <span>Assigned to {task.assignedTo.name}</span>
                        )}
                        {task.dueDate && (
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border-0 font-medium focus:outline-none cursor-pointer ${statusStyles[task.status]}`}
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>

                      {user?.role === 'admin' && (
                        <>
                          <button
                            onClick={() => { setEditTask(task); setShowModal(true) }}
                            className="p-1.5 text-violet-500 hover:text-violet-300 hover:bg-violet-600/10 rounded-lg transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1.5 text-violet-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          task={editTask}
          users={users}
          projectId={id}
          onClose={() => { setShowModal(false); setEditTask(null) }}
          onSave={handleSaveTask}
        />
      )}
    </DashboardLayout>
  )
}
