import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Eye, Edit, Trash2, SlidersHorizontal, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Helper function to resolve absolute/drive/relative URLs smoothly
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

const ItemList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Sync with the global search bar in Layout.jsx via Outlet Context
  const [searchTerm, setSearchTerm] = useOutletContext();

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("API Response:", res.data);

      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res.data?.items)) {
        setItems(res.data.items);
      } else if (Array.isArray(res.data?.data)) {
        setItems(res.data.data);
      } else {
        setItems([]);
        console.warn("Unexpected API format:", res.data);
      }
    } catch (err) {
      console.error("Error fetching items", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItems(items.filter((item) => item._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete the asset. Please try again.");
      }
    }
  };

  // Safe live filtering logic to prevent null-pointer crashes
  const filteredItems = items.filter((item) => {
    const itemNameStr = item.itemName || "";
    const brandStr = item.brand || "";
    const categoryStr = item.category || "";

    const matchesSearch =
      itemNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "" || categoryStr === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === "expired") {
      matchesStatus = item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date();
    } else if (statusFilter === "active") {
      matchesStatus = !item.warrantyExpiry || new Date(item.warrantyExpiry) >= new Date();
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Balanced Theme category badge style mapping (Matching Premium structure)
  const getCategoryBadgeClass = (category) => {
    const cat = (category || "").toLowerCase();
    if (cat.includes("vehicle")) return "bg-slate-900 text-slate-100 border border-slate-800";
    if (cat.includes("appliance") || cat.includes("kitchen")) return "bg-slate-100 text-slate-800 border border-slate-200";
    if (cat.includes("comfort")) return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Assets Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      {/* Main content area */}
      <div className="p-4 lg:p-6 space-y-4 w-full max-w-full">

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={12} className="text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Kitchen Appliances">Kitchen Appliances</option>
              <option value="Home Comfort">Home Comfort (AC, Heater)</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 bg-slate-50/50"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Warranty</option>
            <option value="expired">Expired Warranty</option>
          </select>
        </div>

        {/* Assets Listing Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-150 rounded-2xl">
            <Package size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500 font-semibold text-xs">No assets found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filteredItems.map((item) => {
              const isExpired = item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date();
              const imageSrc = getImageUrl(item);
              
              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs hover:shadow-sm hover:-translate-y-0.5 hover:border-indigo-200/60 transition-all duration-155 flex flex-col justify-between group"
                >
                  <div className="p-4 space-y-3.5">
                    {/* Header: image & Item Name side by side */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-2.5">
                        {/* Live Image */}
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-150 flex items-center justify-center overflow-hidden shrink-0 shadow-xs group-hover:border-indigo-200 transition-colors">
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
                            <span className="text-[10px] text-slate-400 font-bold">
                              {item.itemName ? item.itemName.slice(0, 2).toUpperCase() : "AS"}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{item.itemName}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">Brand: {item.brand || "N/A"}</p>
                        </div>
                      </div>
                      
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {isExpired ? "Expired" : "Active"}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-2 border-t border-slate-50 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Category:</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Warranty Ends:</span>
                        <span className="font-bold text-slate-700">
                          {item.warrantyExpiry
                            ? new Date(item.warrantyExpiry).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions CTA Bar */}
                  <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-100 flex justify-between items-center gap-2 shrink-0">
                    <Link
                      to={`/items/${item._id}`}
                      className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye size={12} /> View details
                    </Link>
                    <div className="flex gap-1.5 text-slate-400">
                      <button 
                        onClick={() => navigate(`/items/edit/${item._id}`)} 
                        className="hover:text-indigo-600 hover:bg-indigo-50/50 p-1 rounded-md transition-all" 
                        title="Edit"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item._id)} 
                        className="hover:text-red-600 hover:bg-red-50 p-1 rounded-md transition-all" 
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default ItemList;