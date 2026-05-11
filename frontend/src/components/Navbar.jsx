import { NavLink } from 'react-router-dom'
import { ROUTES } from '../constants'
import { LayoutDashboardIcon, UploadIcon, PackageIcon, ShoppingCartIcon, SettingsIcon, XIcon } from './Icons'

const links = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboardIcon size={18} /> },
  { to: ROUTES.UPLOAD, label: 'Upload', icon: <UploadIcon size={18} /> },
  { to: ROUTES.INVENTORY, label: 'Inventory', icon: <PackageIcon size={18} /> },
  { to: ROUTES.ORDERS, label: 'Orders', icon: <ShoppingCartIcon size={18} /> },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: <SettingsIcon size={18} /> },
]

export default function Navbar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={onClose} 
        />
      )}
      
      <nav className={`fixed top-0 left-0 h-full w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-50 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-5 py-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <div className="text-teal-400 font-bold text-lg leading-tight">Esnaf Tezgahı</div>
            <div className="text-slate-500 text-xs mt-0.5">AI Operations Platform</div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <XIcon size={20} />
          </button>
        </div>
      <ul className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border border-teal-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              <span className="opacity-80">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4 border-t border-slate-800 text-xs text-slate-600">
        Anadolu Doğal Kooperatifi
      </div>
      </nav>
    </>
  )
}
