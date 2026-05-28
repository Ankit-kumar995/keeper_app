import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import {
  User,
  LogOut,
  Moon,
  Sun,
  Activity,
  ShieldCheck,
  Calendar,
  Mail
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Settings = () => {
  const navigate = useNavigate();
  
  const { user: authUser, logout } = useAuth(); 
  
  const[darkMode, setDarkMode] = useState(false);
  const [apiStatus, setApiStatus] = useState("Checking...");

  const user = {
    name: authUser?.name || authUser?.displayName || "Guest User",
    email: authUser?.email || "No email linked",
    role: authUser?.role || "User",
    profilePic: authUser?.profilePic || authUser?.picture || authUser?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60",
    createdAt: authUser?.createdAt || null
  };

  useEffect(() => {
    const isDark = localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    const checkApiStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApiStatus("Connected");
      } catch (err) {
        console.error("API check failed", err);
        setApiStatus("Disconnected");
      }
    };
    checkApiStatus();
  }, [authUser]);

  const handleThemeToggle = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem("darkMode", nextDark.toString());
    
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout(); 
    }
  };

  return (
    <div className="w-full bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      <div className="flex-1 p-4 lg:p-6 space-y-4 w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Left Grid: User Profile Details */}
          <div className="bg-white border border-slate-150 rounded-xl p-4 flex flex-col items-center text-center shadow-xs md:col-span-1 h-fit">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-blue-400/85 p-0.5 shadow-xs shrink-0">
              <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover rounded-full" />
            </div>
            
            <h2 className="text-sm font-bold text-slate-900 mt-3 leading-snug truncate max-w-full">{user.name}</h2>
            <span className="text-[9px] font-bold bg-neutral-950 text-blue-400 border border-neutral-900 px-2.5 py-0.5 rounded-md mt-1.5 uppercase tracking-wider">
              {user.role}
            </span>

            <div className="w-full border-t border-slate-100 my-4 pt-3 space-y-2.5 text-left text-[11px]">
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                <Mail size={14} className="text-slate-400 shrink-0" />
                <div className="truncate">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Email ID</p>
                  <p className="font-bold text-slate-700 mt-0.5 truncate leading-none">{user.email}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Account Created</p>
                  <p className="font-bold text-slate-700 mt-0.5 leading-none">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-50 hover:bg-red-100/80 text-red-600 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-red-100"
            >
              <LogOut size={12} /> Log Out Account
            </button>
          </div>

          {/* Right Grid: Preferences and System Status */}
          <div className="md:col-span-2 space-y-4">
            
            {/* Preferences Section */}
            <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-950 text-blue-400 flex items-center justify-center border border-neutral-900">
                  <User size={12} />
                </div>
                App Preferences
              </h2>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 leading-none">
                    {darkMode ? <Moon size={12} className="text-blue-500 animate-pulse" /> : <Sun size={12} className="text-blue-500" />}
                    Theme Mode
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Toggle between premium white and dark canvas themes.</p>
                </div>

                <button
                  onClick={handleThemeToggle}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    darkMode ? "bg-neutral-900 border border-blue-400" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-blue-400 transition-transform duration-200 ${
                      darkMode ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* System Status Section */}
            <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-xs space-y-3.5">
              <h2 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-950 text-blue-400 flex items-center justify-center border border-neutral-900">
                  <Activity size={12} />
                </div>
                System Status
              </h2>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-800 leading-none">Backend Connection Status</p>
                  <p className="text-[9px] text-slate-400 mt-1">Server Endpoint: {API_URL}</p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    apiStatus === "Connected" ? "bg-green-500 animate-pulse" : apiStatus === "Checking..." ? "bg-blue-400 animate-bounce" : "bg-red-500 animate-pulse"
                  }`} />
                  <span className={apiStatus === "Connected" ? "text-green-600" : "text-slate-500"}>
                    {apiStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl text-[10px] text-slate-750 font-medium">
                <ShieldCheck className="text-blue-600 shrink-0" size={14} />
                <span>All communications with the MongoDB Atlas cloud database and Google Drive storage are secured with HTTPS encryption protocols.</span>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};

export default Settings;