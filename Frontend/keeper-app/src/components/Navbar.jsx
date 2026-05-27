import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, FolderKanban, PlusCircle, LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // एक्टिव लिंक्स को प्रीमियम ब्लैक एंड येलो स्टाइल में बदलना
  const activeClass = (path) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/')
      ? "flex items-center gap-2 text-neutral-950 font-black border-b-2 border-yellow-400 px-1 py-4"
      : "flex items-center gap-2 text-slate-500 hover:text-neutral-950 px-1 py-4 transition-colors font-semibold";

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-8">
            {/* लोगो को ब्लैक एंड येलो बॉक्स थीम में ढाला गया है */}
            <Link to="/dashboard" className="flex items-center gap-2 text-xl font-black text-slate-900 tracking-wide">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 flex items-center justify-center text-yellow-400 font-extrabold text-sm shadow-sm">
                K
              </div>
              <span>
                Keeper<span className="text-yellow-500">Platform</span>
              </span>
            </Link>
            
            <div className="hidden sm:flex gap-6">
              <Link to="/dashboard" className={activeClass("/dashboard")}>
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link to="/items" className={activeClass("/items")}>
                <FolderKanban size={16} /> Manage Assets
              </Link>
              <Link to="/items/new" className={activeClass("/items/new")}>
                <PlusCircle size={16} /> Add New Asset
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* प्रोफाइल पिक्चर बॉर्डर को येलो (ring-yellow-400) किया गया है */}
                <img
                  src={user.profilePic || user.picture || "https://ui-avatars.com/api/?name=" + user.name}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-yellow-400 object-cover p-0.5"
                />
                <span className="hidden md:inline text-xs font-bold text-slate-800">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut size={15} /> 
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;