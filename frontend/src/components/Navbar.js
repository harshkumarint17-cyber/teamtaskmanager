'use client'

import Image from 'next/image'
import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()

  return (
    <header className="bg-dp-surface border-b border-dp-border px-4 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-violet-400 hover:text-violet-200 p-1"
        >
          <Menu size={22} />
        </button>
        <Image src="/ethara.png" alt="Ethara" width={100} height={30} className="h-7 w-auto object-contain lg:hidden" />
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-violet-400 hidden sm:block">
          Hi, <span className="font-medium text-violet-100">{user?.name}</span>
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  )
}
