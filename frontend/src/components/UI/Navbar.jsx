import { MapPin, Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()

  return (
    <nav className="h-14 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 shrink-0 z-10">
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1.5">
        <MapPin className="w-5 h-5 text-blue-400" />
        <span className="font-bold text-white tracking-tight">GeoPhoto</span>
      </div>

      <div className="flex-1" />

      <span className="text-slate-400 text-sm hidden sm:block">{user?.username}</span>

      <button
        onClick={logout}
        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        title="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </nav>
  )
}
