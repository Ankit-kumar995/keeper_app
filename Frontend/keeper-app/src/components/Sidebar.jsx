import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { 
  Home, 
  Package, 
  PlusCircle, 
  LogOut, 
  Wrench, 
  Bell, 
  FileText, 
  Settings,
  ChevronLeft 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Manage Assets', path: '/items', icon: Package },
  { name: 'Add New Asset', path: '/items/new', icon: PlusCircle },
  { name: 'Maintenance', path: '/maintenance', icon: Wrench },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: authUser, logout } = useAuth();

  const user = {
    name: authUser?.name || authUser?.displayName || "Ankit Kumar",
    email: authUser?.email || "ankit.kumar@example.com",
    profilePic: authUser?.profilePic || authUser?.picture || authUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout(); 
    }
  };

  return (
    <aside className="h-full w-[290px] shrink-0 bg-white flex flex-col justify-between overflow-hidden">
      
      {/* 1. Logo Header */}
      <div className="p-6 border-b border-slate-100 shrink-0 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Keeper</h1>
            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">keep what matters</p>
          </div>
        </div>

        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition shrink-0"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* 2. Navigation Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
        
        <nav className="flex flex-col gap-1.5">
          {menuItems.map(({ name, path, icon: Icon }) => {
            const isActive =
              location.pathname === path ||
              (path === '/dashboard' && location.pathname === '/');

            return (
              <Link
                key={name}
                to={path}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Promo Card */}
        <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 relative overflow-hidden mt-2">
          <div className="relative z-10">
            <h4 className="font-bold text-[10px] text-indigo-950 leading-snug">Never miss<br />maintenance</h4>
            <p className="text-[9px] text-slate-400 mt-1 leading-relaxed">
              Get reminders and keep your assets in shape.
            </p>
            <button 
              onClick={() => navigate('/maintenance')}
              className="w-full mt-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1.5 rounded-lg transition"
            >
              Enable Reminders
            </button>
          </div>
          <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-indigo-100/50 rounded-full flex items-center justify-center">
            <Bell size={24} className="text-indigo-600/40 translate-x-[-4px] translate-y-[-4px]" />
          </div>
        </div>

      </div>

      {/* 3. Footer Profile */}
      <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
        <div onClick={() => navigate("/settings")} className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity overflow-hidden">
          <img
            src={user.profilePic}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/80 p-0.5 shrink-0"
          />
          <div className="truncate max-w-[140px]">
            <p className="text-[11px] font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[9px] text-slate-400 truncate mt-0.5">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition" 
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;