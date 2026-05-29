import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
  Activity,
  Clock,
  Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
  const { user: authUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceFilter, setMaintenanceFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [assetFilterOpen, setAssetFilterOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [localAssetFilter, setLocalAssetFilter] = useState("");

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
  }, [authUser]);

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
    if (cat.includes("vehicle")) return "bg-indigo-50 text-indigo-700 border border-indigo-200/60";
    if (cat.includes("appliance") || cat.includes("kitchen")) return "bg-amber-50 text-amber-700 border border-amber-200/60";
    if (cat.includes("comfort")) return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
    return "bg-gray-50 text-gray-700 border border-gray-200/60";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-xs tracking-wider text-gray-400 uppercase">Loading Dashboard Systems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-gray-50 text-gray-800 font-sans flex flex-col min-h-screen">
      
      {apiError && (
        <div className="bg-red-50 border-b border-red-100 text-red-700 px-4 py-3 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <ShieldAlert size={14} className="animate-bounce" />
          <span>Server Connection Issue: {apiError}. Please double-check your API or sign in again.</span>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-6 w-full max-w-full">

        {/* TOP STATUS BAR (No duplicate Navbar) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">System Live Metrics</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Live database updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          
          <Button
            component={Link}
            to="/items/new"
            variant="contained"
            startIcon={<PlusCircle size={14} />}
            sx={{
              backgroundColor: "#4f46e5",
              color: "#ffffff",
              fontWeight: "600",
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "12px",
              padding: "7px 16px",
              boxShadow: "0px 2px 4px rgba(79, 70, 229, 0.15)",
              fontFamily: "inherit",
              "&:hover": {
                backgroundColor: "#4338ca",
                boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.25)",
              },
            }}
          >
            Quick Add Asset
          </Button>
        </div>

        {/* STATS SECTION - Beautiful modern cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <Link to="/items" className="block transform hover:-translate-y-1 transition-all duration-300">
            <StatCard title="Total Assets" value={totalItems} subtitle="Registered active devices" icon={Package} accentColor="indigo" progress={100} />
          </Link>

          <Link to="/reminders" className="block transform hover:-translate-y-1 transition-all duration-300">
            <StatCard title="Warranty Expiring" value={warrantyCount} subtitle="Due within 30 days" icon={ShieldCheck} accentColor="emerald" progress={totalItems ? Math.round((warrantyCount / totalItems) * 100) : 0} />
          </Link>

          <Link to="/maintenance" className="block transform hover:-translate-y-1 transition-all duration-300">
            <StatCard title="Maintenance Due" value={serviceCount} subtitle="Needs actions this week" icon={Wrench} accentColor="amber" progress={totalItems ? Math.round((serviceCount / totalItems) * 100) : 0} />
          </Link>

          <Link to="/documents" className="block transform hover:-translate-y-1 transition-all duration-300">
            <StatCard title="Total Documents" value={totalItems ? summary?.totalDocuments : 0} subtitle="Warranty papers & invoices" icon={FileText} accentColor="cyan" progress={75} />
          </Link>
        </div>

        {/* PIPELINES GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 w-full">
          
          {/* Maintenance Pipeline Card */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Wrench size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800 tracking-tight">Maintenance Pipelines</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Overdue & upcoming service alerts</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <Tooltip title="Toggle Filter">
                  <IconButton
                    onClick={() => setFilterOpen(!filterOpen)}
                    size="small"
                    sx={{
                      color: filterOpen ? "#4f46e5" : "#6b7280",
                      padding: "6px",
                      backgroundColor: filterOpen ? "rgba(79, 70, 229, 0.05)" : "transparent",
                      border: "1px solid",
                      borderColor: filterOpen ? "rgba(79, 70, 229, 0.2)" : "rgba(229, 231, 235, 0.8)",
                      "&:hover": { color: "#4f46e5", backgroundColor: "rgba(79, 70, 229, 0.05)" }
                    }}
                  >
                    <Filter size={13} />
                  </IconButton>
                </Tooltip>

                <Button
                  component={Link}
                  to="/maintenance"
                  variant="text"
                  endIcon={<ArrowRight size={12} />}
                  sx={{
                    color: "#4f46e5",
                    fontWeight: "700",
                    fontSize: "11px",
                    textTransform: "none",
                    fontFamily: "inherit",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    "&:hover": {
                      color: "#4338ca",
                      backgroundColor: "rgba(79, 70, 229, 0.05)"
                    }
                  }}
                >
                  View All
                </Button>
              </div>
            </div>

            {filterOpen && (
              <div className="mb-3 relative animate-fadeIn">
                <Search size={12} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search pipeline item..."
                  value={maintenanceFilter}
                  onChange={(e) => setMaintenanceFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                />
              </div>
            )}

            <div className="space-y-2.5 flex-1 mt-1">
              {filteredReminders.filter((r) => r.type === "service").length > 0 ? (
                filteredReminders
                  .filter((r) => r.type === "service")
                  .slice(0, 3)
                  .map((reminder, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
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
                            <span className="text-[10px] text-gray-400 font-bold">
                              {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "MN"}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-bold text-sm text-gray-800 leading-tight">{reminder.itemName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                            <Calendar size={11} className="text-gray-400" />
                            <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"
                      }`}>
                        {reminder.badgeText}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200/80">
                  <Activity size={20} className="text-gray-300 mb-1.5" />
                  <span className="text-xs font-semibold text-gray-400">All services are up-to-date</span>
                </div>
              )}
            </div>
          </section>

          {/* Warranty Pipeline Card */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-800 tracking-tight">Warranty Lockouts</h3>
                  <p className="text-[10px] text-gray-400 font-medium">Expiring manufacturer warranties</p>
                </div>
              </div>
              
              <Button
                component={Link}
                to="/reminders"
                variant="text"
                endIcon={<ArrowRight size={12} />}
                sx={{
                  color: "#4f46e5",
                  fontWeight: "700",
                  fontSize: "11px",
                  textTransform: "none",
                  fontFamily: "inherit",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  "&:hover": {
                    color: "#4338ca",
                    backgroundColor: "rgba(79, 70, 229, 0.05)"
                  }
                }}
              >
                View All
              </Button>
            </div>

            <div className="space-y-2.5 flex-1 mt-1">
              {reminders.filter((r) => r.type === "warranty").length > 0 ? (
                reminders
                  .filter((r) => r.type === "warranty")
                  .slice(0, 3)
                  .map((reminder, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-150 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
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
                            <span className="text-[10px] text-gray-400 font-bold">
                              {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "WR"}
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <p className="font-bold text-sm text-gray-800 leading-tight">{reminder.itemName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                            <Calendar size={11} className="text-gray-400" />
                            <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-200/60" : "bg-amber-50 text-amber-700 border-amber-200/60"
                      }`}>
                        {reminder.badgeText}
                      </span>
                    </div>
                  ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200/80">
                  <ShieldCheck size={20} className="text-gray-300 mb-1.5" />
                  <span className="text-xs font-semibold text-gray-400">All warranties are highly secure</span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* RECENT ASSETS SECTION */}
        <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-gray-900 tracking-tight">System Live Inventory</h3>
              <p className="text-[11px] text-gray-400 font-medium">Manage and track your newly added devices and assets</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAssetFilterOpen(!assetFilterOpen)}
                variant="outlined"
                startIcon={<Filter size={13} />}
                sx={{
                  borderColor: assetFilterOpen ? "#4f46e5" : "#e5e7eb",
                  color: assetFilterOpen ? "#4f46e5" : "#4b5563",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  padding: "5px 14px",
                  backgroundColor: assetFilterOpen ? "rgba(79, 70, 229, 0.04)" : "transparent",
                  "&:hover": {
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.06)"
                  }
                }}
              >
                {assetFilterOpen ? "Active Filters" : "Filter Assets"}
              </Button>

              <Button
                component={Link}
                to="/items"
                variant="contained"
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#4f46e5",
                  fontWeight: "600",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  border: "1px solid rgba(79, 70, 229, 0.2)",
                  fontFamily: "inherit",
                  padding: "5px 14px",
                  "&:hover": {
                    backgroundColor: "rgba(79, 70, 229, 0.04)",
                  }
                }}
              >
                View Full Logs
              </Button>
            </div>
          </div>

          {assetFilterOpen && (
            <div className="mb-4 relative animate-fadeIn">
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search across assets, brand or category logs..."
                value={localAssetFilter}
                onChange={(e) => setLocalAssetFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
              />
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-3">Asset Description</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Brand</th>
                  <th className="py-3 px-3">Purchase Date</th>
                  <th className="py-3 px-3">Warranty Expiry</th>
                  <th className="py-3 px-3">Maintenance Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredAssets.map((item, idx) => {
                  const imageSrc = getImageUrl(item);
                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-indigo-50/30 transition-all duration-150 cursor-pointer group"
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-102">
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
                              <span className="text-[10px] text-gray-400 font-bold">
                                {item.itemName ? item.itemName.slice(0, 2).toUpperCase() : "AS"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">
                              {item.itemName}
                            </p>
                            <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">ID: {String(item._id || idx).slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${getCategoryBadgeClass(item.category)}`}>
                          {item.category || "General"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{item.brand || "N/A"}</td>
                      <td className="py-3 px-3 text-gray-500 font-medium">{formatDate(item.purchaseDate)}</td>
                      <td className="py-3 px-3 text-emerald-600 font-semibold">{formatDate(item.warrantyExpiry)}</td>
                      <td className="py-3 px-3 text-amber-600 font-semibold">{formatDate(item.maintenanceDate || item.nextServiceDate)}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          item.statusColor === "red"
                              ? "bg-red-50 text-red-600 border-red-200/60"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                        }`}>
                          {item.statusText || "Operational"}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip title="Modify Asset">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/items/edit/${item._id}`);
                              }}
                              size="small"
                              sx={{
                                color: "#9ca3af",
                                padding: "5px",
                                border: "1px solid rgba(229, 231, 235, 0.8)",
                                borderRadius: "6px",
                                "&:hover": {
                                  color: "#06b6d4",
                                  borderColor: "rgba(6, 182, 212, 0.3)",
                                  backgroundColor: "rgba(6, 182, 212, 0.05)",
                                }
                              }}
                            >
                              <PenSquare size={13} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Retire Asset">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                              size="small"
                              sx={{
                                color: "#9ca3af",
                                padding: "5px",
                                border: "1px solid rgba(229, 231, 235, 0.8)",
                                borderRadius: "6px",
                                "&:hover": {
                                  color: "#ef4444",
                                  borderColor: "rgba(239, 68, 68, 0.3)",
                                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                                }
                              }}
                            >
                              <Trash2 size={13} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400 font-semibold text-xs bg-gray-50/50">
                      No assets found matching the search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 flex justify-between items-center text-xs text-gray-400">
            <span>Showing recent log uploads</span>
            <Link to="/items" className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1.5 transition">
              Explore Entire Warehouse <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// STAT CARD WITH MATCHING GRADIENTS, VIBRANT COLORS AND SMOOTH TRACKS
const StatCard = ({ title, value, subtitle, icon: Icon, accentColor, progress }) => {
  const config = {
    indigo: {
      accent: "bg-indigo-600",
      borderHover: "hover:border-indigo-400 hover:shadow-indigo-50/40",
      iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
      track: "bg-indigo-50",
      progressColor: "bg-indigo-600",
      lightText: "text-indigo-600",
      softBg: "bg-indigo-50/20"
    },
    emerald: {
      accent: "bg-emerald-500",
      borderHover: "hover:border-emerald-400 hover:shadow-emerald-50/40",
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      track: "bg-emerald-50",
      progressColor: "bg-emerald-500",
      lightText: "text-emerald-600",
      softBg: "bg-emerald-50/20"
    },
    amber: {
      accent: "bg-amber-500",
      borderHover: "hover:border-amber-400 hover:shadow-amber-50/40",
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
      track: "bg-amber-50",
      progressColor: "bg-amber-500",
      lightText: "text-amber-600",
      softBg: "bg-amber-50/20"
    },
    cyan: {
      accent: "bg-cyan-500",
      borderHover: "hover:border-cyan-400 hover:shadow-cyan-50/40",
      iconBg: "bg-cyan-50 text-cyan-600 border-cyan-100",
      track: "bg-cyan-50",
      progressColor: "bg-cyan-500",
      lightText: "text-cyan-600",
      softBg: "bg-cyan-50/20"
    }
  };

  const currentTheme = config[accentColor] || config.indigo;

  return (
    <div className={`relative bg-white rounded-2xl p-5 border border-gray-200 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden group shadow-sm ${currentTheme.borderHover} hover:shadow-md`}>
      
      {/* Structural Accent Top Line */}
      <div className={`absolute left-0 right-0 top-0 h-1.5 ${currentTheme.accent} opacity-90`}></div>

      {/* Decorative Accent Glow (Only visible dynamically on hover) */}
      <div className={`absolute right-0 bottom-0 w-24 h-24 rounded-full -mr-8 -mb-8 ${currentTheme.softBg} opacity-20 blur-xl pointer-events-none transition-all duration-500 group-hover:scale-150`}></div>

      <div className="flex items-start justify-between mt-1 relative z-10">
        <div className="flex flex-col">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1 leading-none tracking-tight">{value}</p>
          <p className="text-[10px] text-gray-400 mt-2.5 font-semibold leading-tight">{subtitle}</p>
        </div>
        
        <div className={`w-10 h-10 rounded-xl border ${currentTheme.iconBg} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          <Icon size={18} />
        </div>
      </div>

      {/* Polish Indicator: Micro-Bar Graph with Theme-Integrated Colors */}
      <div className="mt-5 pt-3.5 border-t border-gray-100/80 flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center justify-between text-[9px] font-bold text-gray-400">
          <span className="tracking-wider uppercase">Pipeline health</span>
          <span className={`${currentTheme.lightText}`}>{progress}%</span>
        </div>
        <div className={`w-full ${currentTheme.track} rounded-full h-1.5 overflow-hidden`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${currentTheme.progressColor}`} 
            style={{ width: `${Math.max(8, progress)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;