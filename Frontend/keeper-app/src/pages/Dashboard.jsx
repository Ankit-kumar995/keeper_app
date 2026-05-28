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
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
    if (cat.includes("vehicle")) return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    if (cat.includes("appliance") || cat.includes("kitchen")) return "bg-amber-50 text-amber-700 border border-amber-200";
    if (cat.includes("comfort")) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50 w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-xs tracking-wide text-gray-400">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-gray-50 text-gray-800 font-sans flex flex-col">
      
      {apiError && (
        <div className="bg-red-50 border-b border-red-100 text-red-700 px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2">
          <ShieldAlert size={14} />
          <span>Server Error: {apiError}. Please login again or check if server is running.</span>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-5 w-full max-w-full">

        {/* Action Bar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">System Live Metrics</span>
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
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "12px",
              padding: "6px 16px",
              boxShadow: "0px 2px 4px rgba(79, 70, 229, 0.2)",
              fontFamily: "inherit",
              "&:hover": {
                backgroundColor: "#4338ca",
                boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.3)",
              },
            }}
          >
            Quick Add
          </Button>
        </div>

        {/* PROFESSIONAL STAT CARDS - White background with colored accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
          <Link to="/items" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Total Assets" value={totalItems} subtitle="All items in system" icon={Package} accentColor="indigo" />
          </Link>

          <Link to="/reminders" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Warranty Expiring" value={warrantyCount} subtitle="Active next 30 days" icon={ShieldCheck} accentColor="emerald" />
          </Link>

          <Link to="/maintenance" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Maintenance Due" value={serviceCount} subtitle="Active next 7 days" icon={Wrench} accentColor="amber" />
          </Link>

          <Link to="/documents" className="block transform hover:-translate-y-0.5 transition-all duration-200">
            <StatCard title="Total Documents" value={totalItems ? summary?.totalDocuments : 0} subtitle="Bills & certificates" icon={FileText} accentColor="cyan" />
          </Link>
        </div>

        {/* FEEDS ROW */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          
          {/* Maintenance Feed */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Wrench size={14} />
                </div>
                <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700">Maintenance Pipelines</h3>
              </div>
              
              <div className="flex items-center gap-1">
                <Tooltip title="Filter list">
                  <IconButton
                    onClick={() => setFilterOpen(!filterOpen)}
                    size="small"
                    sx={{
                      color: "#6b7280",
                      padding: "4px",
                      "&:hover": { color: "#4f46e5", backgroundColor: "rgba(79, 70, 229, 0.05)" }
                    }}
                  >
                    <Filter size={14} />
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
                      backgroundColor: "rgba(79, 70, 229, 0.08)"
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50"
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
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
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
                          <span className="text-[9px] text-gray-500 font-bold">
                            {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "MN"}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-sm text-gray-800 leading-tight">{reminder.itemName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          <Calendar size={9} />
                          <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                      reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {reminder.badgeText}
                    </span>
                  </div>
                ))}
              {filteredReminders.filter((r) => r.type === "service").length === 0 && (
                <div className="flex items-center justify-center h-20 text-gray-400 text-xs font-medium">No active maintenance events.</div>
              )}
            </div>
          </section>

          {/* Warranty Feed */}
          <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck size={14} />
                </div>
                <h3 className="font-semibold text-xs uppercase tracking-wide text-gray-700">Warranty Lockouts</h3>
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
                    backgroundColor: "rgba(79, 70, 229, 0.08)"
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
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
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
                          <span className="text-[9px] text-gray-500 font-bold">
                            {reminder.itemName ? reminder.itemName.slice(0, 2).toUpperCase() : "WR"}
                          </span>
                        )}
                      </div>
                      
                      <div>
                        <p className="font-semibold text-sm text-gray-800 leading-tight">{reminder.itemName}</p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                          <Calendar size={9} />
                          <span>{reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                      reminder.statusColor === "red" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {reminder.badgeText}
                    </span>
                  </div>
                ))}
              {reminders.filter((r) => r.type === "warranty").length === 0 && (
                <div className="flex items-center justify-center h-20 text-gray-400 text-xs font-medium">No active warranty alerts.</div>
              )}
            </div>
          </section>
        </div>

        {/* ALL ASSETS TABLE */}
        <section className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-gray-900 tracking-tight">All Assets</h3>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAssetFilterOpen(!assetFilterOpen)}
                variant="outlined"
                startIcon={<Filter size={14} />}
                sx={{
                  borderColor: "#d1d5db",
                  color: "#4f46e5",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontWeight: "600",
                  fontFamily: "inherit",
                  padding: "5px 12px",
                  "&:hover": {
                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.08)"
                  }
                }}
              >
                Filter
              </Button>

              <Button
                component={Link}
                to="/items/new"
                variant="contained"
                startIcon={<PlusCircle size={14} />}
                sx={{
                  backgroundColor: "#4f46e5",
                  color: "#ffffff",
                  fontWeight: "600",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "11px",
                  fontFamily: "inherit",
                  padding: "5px 12px",
                  boxShadow: "0px 2px 4px rgba(79, 70, 229, 0.2)",
                  "&:hover": {
                    backgroundColor: "#4338ca",
                    boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.3)"
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
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-2">Asset</th>
                  <th className="py-2.5 px-2">Category</th>
                  <th className="py-2.5 px-2">Brand</th>
                  <th className="py-2.5 px-2">Purchase Date</th>
                  <th className="py-2.5 px-2">Warranty Expiry</th>
                  <th className="py-2.5 px-2">Maintenance Date</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredAssets.map((item, idx) => {
                  const imageSrc = getImageUrl(item);
                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-indigo-50/50 hover:shadow-xs transition-all duration-150 cursor-pointer group"
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
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
                              <span className="text-[9px] text-gray-500 font-bold">
                                {item.itemName ? item.itemName.slice(0, 2).toUpperCase() : "AS"}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">
                            {item.itemName}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-semibold ${getCategoryBadgeClass(item.category)}`}>
                          {item.category || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-700 font-medium">{item.brand || "N/A"}</td>
                      <td className="py-3 px-2 text-gray-500 font-medium">{formatDate(item.purchaseDate)}</td>
                      <td className="py-3 px-2 text-emerald-600 font-semibold">{formatDate(item.warrantyExpiry)}</td>
                      <td className="py-3 px-2 text-amber-600 font-semibold">{formatDate(item.maintenanceDate || item.nextServiceDate)}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                          item.statusColor === "red"
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {item.statusText || "Active"}
                        </span>
                      </td>

                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-1">
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/items/edit/${item._id}`);
                              }}
                              size="small"
                              sx={{
                                color: "#9ca3af",
                                padding: "4px",
                                "&:hover": {
                                  color: "#06b6d4",
                                  backgroundColor: "rgba(6, 182, 212, 0.08)",
                                }
                              }}
                            >
                              <PenSquare size={14} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item._id);
                              }}
                              size="small"
                              sx={{
                                color: "#9ca3af",
                                padding: "4px",
                                "&:hover": {
                                  color: "#ef4444",
                                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-400 font-medium text-xs">
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-start">
            <Link to="/items" className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition">
              View all assets <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

// PROFESSIONAL STAT CARD - White background with colored left accent
const StatCard = ({ title, value, subtitle, icon: Icon, accentColor }) => {
  const accentClasses = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    cyan: "bg-cyan-500"
  };

  const iconBgClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    cyan: "bg-cyan-50 text-cyan-600"
  };

  return (
    <div className="relative bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5 transition-all duration-200 ease-out cursor-pointer flex flex-col justify-between overflow-hidden group shadow-sm">
      
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClasses[accentColor]}`}></div>

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 leading-none">{value}</p>
          <p className="text-[10px] text-gray-500 mt-1 font-medium leading-none">{subtitle}</p>
        </div>
        
        <div className={`w-9 h-9 rounded-lg ${iconBgClasses[accentColor]} flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200`}>
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-100 flex justify-between items-center">
        <div className={`w-10 h-0.5 rounded-full bg-gradient-to-r ${accentClasses[accentColor]} to-transparent opacity-30 group-hover:opacity-60 transition-opacity`}></div>
        <Activity size={10} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </div>
  );
};

export default Dashboard;