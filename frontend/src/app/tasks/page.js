'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { CheckSquare } from 'lucide-react'

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

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await api.get('/api/tasks')
        setTasks(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  async function handleStatusChange(taskId, status) {
    try {
      const res = await api.put(`/api/tasks/${taskId}`, { status })
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      console.error(err)
    }
  }

  const now = new Date()

  const filtered = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'overdue') return t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    return t.status === filter
  })

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'todo', label: 'Todo' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'done', label: 'Done' },
    { key: 'overdue', label: 'Overdue' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-violet-50">Tasks</h1>
          <p className="text-sm text-violet-400 mt-1">
            {user?.role === 'admin' ? 'All tasks across projects' : 'Your assigned tasks'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'bg-dp-surface text-violet-400 border border-dp-border hover:bg-dp-raised'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                filter === tab.key ? 'bg-violet-500 text-white' : 'bg-white/10 text-violet-400'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-violet-600">
            <CheckSquare size={44} className="mx-auto mb-3" />
            <p className="text-violet-500 font-medium">No tasks found</p>
          </div>
        ) : (
          <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
            <div className="divide-y divide-dp-bsoft">
              {filtered.map(task => {
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
                        {task.projectId?.title && (
                          <span className="text-violet-400 font-medium">{task.projectId.title}</span>
                        )}
                        {task.assignedTo && <span>Assigned to {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={isOverdue ? 'text-red-400' : ''}>
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <select
                      value={task.status}
                      onChange={e => handleStatusChange(task._id, e.target.value)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border-0 font-medium focus:outline-none cursor-pointer shrink-0 ${statusStyles[task.status]}`}
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
