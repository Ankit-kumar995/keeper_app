import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, ChevronDown, ArrowLeft, Menu } from "lucide-react"; 
import { useAuth } from "../context/AuthContext"; 

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) return false;
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const { user: authUser } = useAuth();

  const user = {
    name: authUser?.name || authUser?.displayName || "Ankit Kumar",
    role: authUser?.role || "Admin",
    profilePic: authUser?.profilePic || authUser?.picture || authUser?.imageUrl || authUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
  };

  useEffect(() => {
    setSearchTerm("");
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      const nextState = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(nextState));
      return nextState;
    });
  };

  const getHeaderDetails = (pathname) => {
    if (pathname === "/" || pathname === "/dashboard") {
      return { title: "Dashboard", subtitle: "Real-time tracking of system and storage assets." };
    }
    if (pathname === "/items") {
      return { title: "Manage Assets", subtitle: "Track and manage your registered home equipment." };
    }
    if (pathname === "/items/new") {
      return { title: "Register New Asset", subtitle: "Add new devices and warranty documents." };
    }
    if (pathname.startsWith("/items/edit/")) {
      return { title: "Edit Registered Asset", subtitle: "Update details and attachments for your asset." };
    }
    if (pathname.includes("/items/")) {
      return { title: "Asset Details", subtitle: "Complete specification and document folders." };
    }
    if (pathname === "/maintenance") {
      return { title: "Maintenance Vault", subtitle: "Track, schedule, and log services for your household assets." };
    }
    if (pathname === "/reminders") {
      return { title: "Reminders & Alerts", subtitle: "Track expirations and maintain healthy device cycles." };
    }
    if (pathname === "/documents") {
      return { title: "Document Vault", subtitle: "Access, view, and organize all attachment sheets in one place." };
    }
    if (pathname === "/settings") {
      return { title: "Settings & Profile", subtitle: "Manage your profile, active sessions, and app preferences." };
    }
    return { title: "Keeper Platform", subtitle: "Keep what matters." };
  };

  const headerInfo = getHeaderDetails(location.pathname);
  const showBackButton = location.pathname !== "/" && location.pathname !== "/dashboard";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* ✅ Fix: Desktop — sidebar properly shows/hides with width animation */}
      <div
        className={`h-screen shrink-0 transition-all duration-300 ease-in-out overflow-hidden
          fixed lg:relative z-50 lg:z-auto
          ${isSidebarOpen ? "w-[290px] border-r border-slate-200" : "w-0 border-r-0"}
        `}
      >
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen flex flex-col min-w-0 bg-white">
        
        {/* Header */}
        <header className="sticky top-0 z-50 h-[78px] w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between shrink-0">
          
          <div className="flex items-center gap-2">

            {/* ✅ Fix: Single hamburger button — visible on ALL screen sizes when sidebar is closed */}
            {!isSidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition mr-1 shrink-0"
                title="Open Menu"
              >
                <Menu size={18} />
              </button>
            )}

            {showBackButton && (
              <button 
                onClick={() => navigate(-1)} 
                className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition mr-2" 
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-black text-slate-955 leading-tight tracking-tight">
                {headerInfo.title}
              </h2>
              <p className="text-[10px] font-semibold text-slate-400 leading-none mt-1">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Search & Profile */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative w-44 sm:w-64 md:w-80 hidden md:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 outline-none transition-all duration-200 focus:bg-white focus:ring-4 focus:ring-yellow-400/15 focus:border-yellow-400"
                placeholder="Live search across pages..."
              />
            </div>

            <button 
              onClick={() => navigate("/reminders")} 
              className="relative p-2.5 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 shrink-0"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-yellow-400 border-2 border-white animate-pulse"></span>
            </button>

            <div 
              onClick={() => navigate("/settings")}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-100 cursor-pointer hover:opacity-85 transition-opacity shrink-0"
            >
              <div className="w-9 h-9 rounded-2xl bg-slate-150 flex items-center justify-center overflow-hidden border border-slate-150 shrink-0">
                <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <span className="text-[10px] font-bold bg-yellow-400 text-black px-1.5 py-0.5 rounded-md mt-1 block w-fit leading-none">{user.role}</span>
              </div>
              <ChevronDown size={14} className="text-slate-400 shrink-0" />
            </div>
          </div>

        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <Outlet context={[searchTerm, setSearchTerm]} />
        </div>

      </div>

    </div>
  );
};

export default Layout;