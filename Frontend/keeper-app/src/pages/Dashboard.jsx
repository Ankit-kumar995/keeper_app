import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Button, IconButton, Tooltip } from "@mui/material"; 
import {
  Package,
  PlusCircle,
  Wrench,
  ShieldAlert,
  ArrowRight,
  Filter,
  PenSquare,
  Trash2,
  FileText,
  ShieldCheck,
  Calendar,
  Activity
} from "lucide-react";

// Define backend base URL with fallback
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Soft Accent Line for cards
const SparkLine = ({ className }) => (
  <div className={`w-14 h-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-transparent ${className}`} />
);

// Date formatting helper to fix raw ISO timestamps shown in your table
const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "null" || dateStr === "undefined" || dateStr === "N/A") return "N/A";
  if (dateStr.length < 12 && !dateStr.includes("T")) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch (e) {
    return dateStr;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceFilter, setMaintenanceFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [assetFilterOpen, setAssetFilterOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Decoupled local table filter state to prevent conflict with navbar search
  const [localAssetFilter, setLocalAssetFilter] = useState("");

  // Dynamic user session data state
  const [user, setUser] = useState({
    name: "Ankit Kumar",
    email: "ankit.kumar@example.com",
    role: "Admin",
    profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const mappedUser = {
          name: parsed.name || parsed.displayName || "Ankit Kumar",
          email: parsed.email || "ankit.kumar@example.com",
          role: parsed.role || "Admin",
          profilePic: parsed.profilePic || parsed.picture || parsed.imageUrl || parsed.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60"
        };
        setUser(mappedUser);
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const getImageUrl = (item) => {
    let rawUrl = item?.productImageUrl || item?.imageUrl || item?.productImage || item?.image || "";

    if (!rawUrl && item?.documents && Array.isArray(item.documents)) {
      const foundImg = item.documents.find(
        (d) => d && (d.name === "productImage" || d.type === "productImage")
      );
      if (foundImg) rawUrl = foundImg.url;
    }

    if (!rawUrl || rawUrl === "null" || rawUrl === "undefined" || rawUrl.trim() === "") {
      return "";
    }

    if (rawUrl.includes("drive.google.com")) {
      const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`;
      }
    }

    let sanitizedUrl = rawUrl.replace(/\\/g, "/");

    if (sanitizedUrl.startsWith("http://") || sanitizedUrl.startsWith("https://") || sanitizedUrl.startsWith("data:")) {
      return sanitizedUrl;
    }

    if (sanitizedUrl.includes("uploads/")) {
      const index = sanitizedUrl.indexOf("uploads/");
      sanitizedUrl = sanitizedUrl.slice(index);
    } else if (!sanitizedUrl.includes("uploads/")) {
      sanitizedUrl = `uploads/${sanitizedUrl.startsWith("/") ? sanitizedUrl.slice(1) : sanitizedUrl}`;
    }

    if (sanitizedUrl === "undefined" || sanitizedUrl === "null") {
      return "";
    }

    return `${API_URL}${sanitizedUrl.startsWith("/") ? "" : "/"}${sanitizedUrl}`;
  };

  const fetchSummary = async () => {
    try {
      setApiError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authorization token found. Please login again.");
      }
      
      const res = await axios.get(`${API_URL}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      let summaryData = { ...res.data };
      
      try {
        const itemsRes = await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let itemsList = [];
        if (Array.isArray(itemsRes.data)) {
          itemsList = itemsRes.data;
        } else if (Array.isArray(itemsRes.data?.items)) {
          itemsList = itemsRes.data.items;
        } else if (Array.isArray(itemsRes.data?.data)) {
          itemsList = itemsRes.data.data;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let docCount = 0;
        let wCount = 0; 
        let sCount = 0; 
        const calculatedReminders = [];
        
        itemsList.forEach((item) => {
          if (item.documents && Array.isArray(item.documents)) {
            docCount += item.documents.length;
          }
          
          const currentItemImg = getImageUrl(item);

          if (item.warrantyExpiry) {
            const wDate = new Date(item.warrantyExpiry);
            const diffTime = wDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 30) {
              wCount++;
              calculatedReminders.push({
                itemName: item.itemName,
                dueDate: item.warrantyExpiry,
                type: "warranty",
                statusColor: diffDays < 0 ? "red" : "yellow",
                badgeText: diffDays < 0 ? "Expired" : `${diffDays} Days Left`,
                imgUrl: currentItemImg
              });
            }
          }
          
          const serviceDateStr = item.nextServiceDate || item.maintenanceDate;
          if (serviceDateStr) {
            const sDate = new Date(serviceDateStr);
            const diffTime = sDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 7) {
              sCount++;
              calculatedReminders.push({
                itemName: item.itemName,
                dueDate: serviceDateStr,
                type: "service",
                statusColor: diffDays < 0 ? "red" : "yellow",
                badgeText: diffDays < 0 ? "Overdue" : `${diffDays} Days Left`,
                imgUrl: currentItemImg
              });
            }
          }
        });

        calculatedReminders.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        
        summaryData.totalItems = itemsList.length;
        summaryData.totalDocuments = docCount;
        summaryData.warrantyCount = wCount;
        summaryData.serviceCount = sCount;
        summaryData.recentlyUploaded = itemsList.slice(0, 4);
        summaryData.upcomingReminders = calculatedReminders;
        
      } catch (err) {
        console.warn("Client-side metrics calculation failed. Using server fallback.", err);
      }
      
      setSummary(summaryData);
    } catch (err) {
      console.error("ERROR - Failed to load original data from backend:", err);
      setApiError(err.response?.data?.message || err.message || "Failed to connect to backend server.");
      
      setSummary({
        totalItems: 0,
        warrantyCount: 0,
        serviceCount: 0,
        totalDocuments: 0,
        upcomingReminders: [],
        recentlyUploaded: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchSummary();
      } catch (err) {
        console.error("Delete failed from dashboard", err);
        alert("Could not delete item. Check connection.");
      }
    }
  };

  const totalItems = summary?.totalItems || 0;
  const reminders = summary?.upcomingReminders || [];
  const recentItems = summary?.recentlyUploaded || [];
  const warrantyCount = summary?.warrantyCount || 0;
  const serviceCount = summary?.serviceCount || 0;

  const filteredReminders = maintenanceFilter
    ? reminders.filter((r) =>
        (r.itemName || "").toLowerCase().includes(maintenanceFilter.toLowerCase())
      )
    : reminders;

  const filteredAssets = localAssetFilter
    ? recentItems.filter((item) =>
        (item.itemName || "").toLowerCase().includes(localAssetFilter.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(localAssetFilter.toLowerCase()) ||
        (item.brand || "").toLowerCase().includes(localAssetFilter.toLowerCase())
      )
    : recentItems;

  const getCategoryBadgeClass = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("vehicle")) return "bg-slate-900 text-yellow-400 border border-slate-800";
    if (cat.includes("appliance") || cat.includes("kitchen")) return "bg-yellow-50 text-slate-900 border border-yellow-200";
    if (cat.includes("comfort")) return "bg-yellow-400/10 text-slate-900 border border-yellow-400/30";
    return "bg-slate-100 text-slate-750 border border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-800 font-sans flex flex-col">
      
      {apiError && (
        <div className="bg-red-50 border-b border-red-100 text-red-700 px-4 py-2.5 text-[11px] font-semibold text-center flex items-center justify-center gap-2">
          <ShieldAlert size={14} />
          <span>Server Error: {apiError}. Showing empty dashboard. Please login again or check if server is running.</span>
        </div>
      )}

      {/* Main dashboard content area */}
      <div className="p-4 lg:p-6 space-y-5 w-full max-w-full">

        {/* Action Bar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550">System Live Metrics</span>
          </div>
          
          <Button
            component={Link}
            to="/items/new"
            variant="contained"
            startIcon={<PlusCircle size={12} />}
            sx={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              fontWeight: "600",
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "11px",
              padding: "5px 14px",
              boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
              fontFamily: "inherit",
              "&:hover": {
                backgroundColor: "#4338ca",
                boxShadow: "0px 3px 8px rgba(79, 70, 229, 0.15)",
              },
            }}
          >
            Quick Add
          </Button>
        </div>

        {/* SOFT SLATE-DARK METRIC STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <Link to="/items" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Total Assets" value={totalItems} subtitle="All items in system" icon={Package} accentBgClass="bg-yellow-400" />
          </Link>

          <Link to="/reminders" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Warranty Expiring" value={warrantyCount} subtitle="Active next 30 days" icon={ShieldCheck} accentBgClass="bg-emerald-500" />
          </Link>

          <Link to="/maintenance" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Maintenance Due" value={serviceCount} subtitle="Active next 7 days" icon={Wrench} accentBgClass="bg-amber-500" />
          </Link>

          <Link to="/documents" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Total Documents" value={totalItems ? summary?.totalDocuments : 0} subtitle="Bills & certificates" icon={FileText} accentBgClass="bg-cyan-500" />
          </Link>
        </div>

        {/* SOFT SLATE-ACCENTED FEEDS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          
          {/* Maintenance Feed */}
          <section className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-yellow-400 flex items-center justify-center">
                  <Wrench size={12} />
                </div>
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-800">Maintenance Pipelines</h3>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip title="Filter list">
                  <IconButton
                    onClick={() => setFilterOpen(!filterOpen)}
                    size="small"
                    sx={{
                      color: "#64748b",
                      padding: "4px",
                      "&:hover": { color: "#4f46e5" }
                    }}
                  >
                    <Filter size={12} />
                  </IconButton>
                </Tooltip>

                <Button
                  component={Link}
                  to="/maintenance"
                  variant="text"
                  endIcon={<ArrowRight size={12} />}
                  sx={{
                    color: "#4f46e5",
                    fontWeight: "600",
                    fontSize: "11px",
                    textTransform: "none",
                    fontFamily: "inherit",
                    padding: "1px 6px",
                    "&:hover": {
                      color: "#4338ca",
                      backgroundColor: "rgba(79, 70, 229, 0.04)"
                    }
                  }}
                >
                  View
                </Button>
              </div>
            </div>

            {filterOpen && (
              <div className="mb-3 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] outline-none transition focus:border-yellow-400 bg-slate-50"
                />
              </div>
            )}

            <div className="space-y-2 flex-1">
              {filteredReminders
                .filter((r) => r.type === "service")
                .slice(0, 3)
                .map((reminder, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 rounded-lg border-l-3 border-l-slate-900 border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {reminder.imgUrl ? (
                          <img 
                            src={reminder.imgUrl} 
                            alt={reminder.itemName} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&auto=format&fit=crop&q=60"; 
                            }} 
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold">
                            {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "MN"}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-xs text-slate-800 leading-tight">{reminder.itemName}</p>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                          <Calendar size={8} />
                          <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-100" : "bg-yellow-50 text-yellow-850 border-yellow-200"
                    }`}>
                      {reminder.badgeText}
                    </span>
                  </div>
                ))}
              {filteredReminders.filter((r) => r.type === "service").length === 0 && (
                <div className="flex items-center justify-center h-20 text-slate-400 text-[11px] font-medium">No active maintenance events.</div>
              )}
            </div>
          </section>

          {/* Warranty Feed */}
          <section className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-slate-900 text-yellow-400 flex items-center justify-center">
                  <ShieldCheck size={12} />
                </div>
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-800">Warranty Lockouts</h3>
              </div>
              
              <Button
                component={Link}
                to="/reminders"
                variant="text"
                endIcon={<ArrowRight size={12} />}
                sx={{
                  color: "#4f46e5",
                  fontWeight: "600",
                  fontSize: "11px",
                  textTransform: "none",
                  fontFamily: "inherit",
                  padding: "1px 6px",
                  "&:hover": {
                    color: "#4338ca",
                    backgroundColor: "rgba(79, 70, 229, 0.04)"
                  }
                }}
              >
                View
              </Button>
            </div>

            <div className="space-y-2 flex-1">
              {reminders
                .filter((r) => r.type === "warranty")
                .slice(0, 3)
                .map((reminder, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2.5 rounded-lg border-l-3 border-l-yellow-400 border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {reminder.imgUrl ? (
                          <img 
                            src={reminder.imgUrl} 
                            alt={reminder.itemName} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&auto=format&fit=crop&q=60"; 
                            }} 
                          />
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold">
                            {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "WR"}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-xs text-slate-800 leading-tight">{reminder.itemName}</p>
                        <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">
                          <Calendar size={8} />
                          <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-100" : "bg-yellow-50 text-yellow-850 border-yellow-200"
                    }`}>
                      {reminder.badgeText}
                    </span>
                  </div>
                ))}
              {reminders.filter((r) => r.type === "warranty").length === 0 && (
                <div className="flex items-center justify-center h-20 text-slate-400 text-[11px] font-medium">No active warranty alerts.</div>
              )}
            </div>
          </section>
        </div>

        {/* ALL ASSETS TABLE LIST WITH MODERN BLUE/INDIGO HOVER-SHADOW & BACKGROUND GLOW EFFECT */}
        <section className="bg-white border border-slate-150 rounded-xl p-4 shadow-xs hover:shadow-lg hover:shadow-indigo-550/15 hover:border-indigo-150 hover:bg-indigo-50/20 transition-all duration-300 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">All Assets</h3>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAssetFilterOpen(!assetFilterOpen)}
                variant="outlined"
                startIcon={<Filter size={12} />}
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#4f46e5",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  padding: "4px 10px",
                  "&:hover": {
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.04)"
                  }
                }}
              >
                Filter
              </Button>

              <Button
                component={Link}
                to="/items/new"
                variant="contained"
                startIcon={<PlusCircle size={12} />}
                sx={{
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  fontWeight: "600",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  padding: "4px 10px",
                  boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                  "&:hover": {
                    backgroundColor: "#4338ca",
                    boxShadow: "0px 3px 8px rgba(79, 70, 229, 0.15)"
                  }
                }}
              >
                Add Asset
              </Button>
            </div>
          </div>

          {assetFilterOpen && (
            <div className="mb-3 animate-fadeIn">
              <input
                type="text"
                placeholder="Search table locally..."
                value={localAssetFilter}
                onChange={(e) => setLocalAssetFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-[11px] outline-none transition focus:border-indigo-500"
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                  <th className="py-2 px-1.5">Asset</th>
                  <th className="py-2 px-1.5">Category</th>
                  <th className="py-2 px-1.5">Brand</th>
                  <th className="py-2 px-1.5">Purchase Date</th>
                  <th className="py-2 px-1.5">Warranty Expiry</th>
                  <th className="py-2 px-1.5">Maintenance Date</th>
                  <th className="py-2 px-1.5">Status</th>
                  <th className="py-2 px-1.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[11px]">
                {filteredAssets.map((item, idx) => {
                  const imageSrc = getImageUrl(item);
                  return (
                    <tr 
                      key={item._id || idx} 
                      className="hover:bg-indigo-50/80 hover:shadow-xs transition-all duration-150 cursor-pointer group"
                    >
                      <td className="py-2 px-1.5" onClick={() => navigate(`/items/edit/${item._id}`)}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {imageSrc ? (
                              <img 
                                src={imageSrc} 
                                alt={item.itemName} 
                                className="w-full h-full object-cover" 
                                onError={(e) => { 
                                  e.currentTarget.onerror = null; 
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=80&auto=format&fit=crop&q=60"; 
                                }} 
                              />
                            ) : (
                              <span className="text-[8px] text-slate-400 font-bold">
                                {item.itemName ? item.itemName.slice(0, 2).toUpperCase() : "AS"}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 leading-snug group-hover:text-[#4f46e5] transition-colors">{item.itemName}</p>
                        </div>
                      </td>
                      <td className="py-2 px-1.5" onClick={() => navigate(`/items/edit/${item._id}`)}>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${getCategoryBadgeClass(item.category)}`}>
                          {item.category || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 px-1.5 text-slate-600 font-semibold" onClick={() => navigate(`/items/edit/${item._id}`)}>{item.brand || "N/A"}</td>
                      <td className="py-2 px-1.5 text-slate-400 font-medium" onClick={() => navigate(`/items/edit/${item._id}`)}>{formatDate(item.purchaseDate)}</td>
                      <td className="py-2 px-1.5 text-emerald-600 font-bold" onClick={() => navigate(`/items/edit/${item._id}`)}>{formatDate(item.warrantyExpiry)}</td>
                      <td className="py-2 px-1.5 text-amber-600 font-bold" onClick={() => navigate(`/items/edit/${item._id}`)}>{formatDate(item.maintenanceDate || item.nextServiceDate)}</td>
                      <td className="py-2 px-1.5" onClick={() => navigate(`/items/edit/${item._id}`)}>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                          item.statusColor === "red" ? "bg-red-50 text-red-600 border-red-100" : "bg-yellow-50 text-yellow-850 border-yellow-200"
                        }`}>
                          {item.statusText || "Active"}
                        </span>
                      </td>
                      <td className="py-2 px-1.5">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => navigate(`/items/edit/${item._id}`)}
                              size="small"
                              sx={{
                                color: "#94a3b8",
                                padding: "4px",
                                "&:hover": {
                                  color: "#06b6d4",
                                  backgroundColor: "rgba(6, 182, 212, 0.08)",
                                }
                              }}
                            >
                              <PenSquare size={12} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => handleDelete(item._id)}
                              size="small"
                              sx={{
                                color: "#94a3b8",
                                padding: "4px",
                                "&:hover": {
                                  color: "#ef4444",
                                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                                }
                              }}
                            >
                              <Trash2 size={12} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-slate-400 font-medium text-xs">No assets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-start">
            <Link to="/items" className="text-cyan-500 hover:text-cyan-600 text-[11px] font-bold flex items-center gap-1 transition">
              View all assets <ArrowRight size={12} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// PREMIUM SOFT SLATE-DARK STAT CARD COMPONENT
const StatCard = ({ title, value, subtitle, icon: Icon, accentBgClass }) => {
  return (
    <div className="relative bg-slate-900 text-white rounded-xl p-4 border border-slate-800 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between overflow-hidden group shadow-xs">
      
      {/* Dynamic Colored Accent Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBgClass}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-white mt-1 leading-none">{value}</p>
          <p className="text-[9px] text-slate-400 mt-1 font-medium leading-none">{subtitle}</p>
        </div>
        
        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-400 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
          <Icon size={14} />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
        <SparkLine className="opacity-40 group-hover:opacity-100 transition-opacity" />
        <Activity size={9} className="text-slate-500 group-hover:text-yellow-400 transition-colors animate-pulse" />
      </div>
    </div>
  );
};

export default Dashboard;