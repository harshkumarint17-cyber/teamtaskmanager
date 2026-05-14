'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

const PIE_COLORS = ['#8b5cf6', '#a78bfa', '#22c55e', '#ef4444']

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, taskRes] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/tasks')
        ])
        setProjects(projRes.data)
        setTasks(taskRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const now = new Date()
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const pendingTasks = tasks.filter(t => t.status === 'todo').length
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done').length

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderKanban, bg: 'bg-violet-600/20', color: 'text-violet-400' },
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, bg: 'bg-purple-600/20', color: 'text-purple-400' },
    { label: 'Pending Tasks', value: pendingTasks, icon: Clock, bg: 'bg-yellow-500/20', color: 'text-yellow-400' },
    { label: 'Overdue Tasks', value: overdueTasks, icon: AlertCircle, bg: 'bg-red-500/20', color: 'text-red-400' },
  ]

  const pieData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { name: 'Done', value: completedTasks },
    { name: 'Overdue', value: overdueTasks },
  ].filter(d => d.value > 0)

  const barData = projects.slice(0, 6).map(p => {
    const projectTasks = tasks.filter(t => {
      const pid = t.projectId?._id || t.projectId
      return pid === p._id || pid?.toString() === p._id?.toString()
    })
    return {
      name: p.title.length > 10 ? p.title.substring(0, 10) + '...' : p.title,
      tasks: projectTasks.length,
      done: projectTasks.filter(t => t.status === 'done').length
    }
  })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-violet-50">Dashboard</h1>
          <p className="text-sm text-violet-400 mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-dp-surface rounded-xl p-5 border border-dp-border">
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

        {totalTasks > 0 && (
          <div className="bg-dp-surface rounded-xl p-5 border border-dp-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-violet-100">Overall Completion</span>
              <span className="text-sm font-bold text-violet-400">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 bg-dp-high rounded-full">
              <div
                className="h-2 bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%` }}
              />
            </div>
            <p className="text-xs text-violet-500 mt-1.5">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dp-surface rounded-xl p-5 border border-dp-border">
            <h2 className="text-sm font-semibold text-violet-100 mb-4">Tasks per Project</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d1d5a" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#a78bfa' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#a78bfa' }} />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="done" fill="#22c55e" radius={[4, 4, 0, 0]} name="Done" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-violet-600 text-sm">
                No project data yet
              </div>
            )}
          </div>

          <div className="bg-dp-surface rounded-xl p-5 border border-dp-border">
            <h2 className="text-sm font-semibold text-violet-100 mb-4">Task Status Breakdown</h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-violet-600 text-sm">
                No task data yet
              </div>
            )}
          </div>
        </div>

        {user?.role === 'member' && (
          <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
            <div className="px-5 py-4 border-b border-dp-bsoft">
              <h2 className="text-sm font-semibold text-violet-100">My Assigned Tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="py-10 text-center text-violet-600 text-sm">No tasks assigned to you yet</div>
            ) : (
              <div className="divide-y divide-dp-bsoft">
                {tasks.slice(0, 8).map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
                  return (
                    <div key={task._id} className="px-5 py-3.5 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        task.status === 'done' ? 'bg-green-400' :
                        task.status === 'in-progress' ? 'bg-blue-400' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-violet-100 truncate">{task.title}</p>
                        <p className="text-xs text-violet-500 mt-0.5 truncate">
                          {task.projectId?.title}
                          {task.dueDate && (
                            <span className={isOverdue ? ' text-red-400' : ''}>
                              {' · '}Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-white/10 text-violet-400'
                      }`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        task.status === 'done' ? 'bg-green-500/20 text-green-400' :
                        task.status === 'in-progress' ? 'bg-violet-500/20 text-violet-300' :
                        'bg-white/10 text-violet-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="bg-dp-surface rounded-xl border border-dp-border overflow-hidden">
          <div className="px-5 py-4 border-b border-dp-bsoft">
            <h2 className="text-sm font-semibold text-violet-100">Recent Projects</h2>
          </div>
          {projects.length > 0 ? (
            <div className="divide-y divide-dp-bsoft">
              {projects.slice(0, 5).map(project => {
                const projectTasks = tasks.filter(t => {
                  const pid = t.projectId?._id || t.projectId
                  return pid === project._id || pid?.toString() === project._id?.toString()
                })
                const done = projectTasks.filter(t => t.status === 'done').length
                const progress = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0
                return (
                  <div key={project._id} className="px-5 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-violet-100 text-sm truncate">{project.title}</p>
                      <p className="text-xs text-violet-500 mt-0.5">{projectTasks.length} tasks</p>
                    </div>
                    <div className="w-28 hidden sm:block">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-violet-400">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-dp-high rounded-full">
                        <div className="h-1.5 bg-violet-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                      project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'completed' ? 'bg-violet-500/20 text-violet-300' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-violet-600 text-sm">
              No projects yet
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
