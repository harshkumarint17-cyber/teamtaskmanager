'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  User,
  X
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Profile', href: '/profile', icon: User },
]

const adminItems = [
  { label: 'Admin Panel', href: '/admin', icon: Users },
]

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const allItems = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-dp-surface border-r border-dp-border
        transform transition-transform duration-200 ease-in-out flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-5 border-b border-dp-border">
          <div className="flex items-center gap-2">
            <Image src="/ethara.png" alt="Ethara" width={120} height={36} className="h-9 w-auto object-contain" priority />
          </div>
          <button onClick={onClose} className="lg:hidden text-violet-400 hover:text-violet-200">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {allItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-dp-bstrong'
                    : 'text-violet-400 hover:bg-dp-raised hover:text-violet-200'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-dp-bsoft">
          <div className="flex items-center gap-3">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-violet-100 truncate">{user?.name}</p>
              <p className="text-xs text-violet-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
