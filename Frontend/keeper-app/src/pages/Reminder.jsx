import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  Bell,
  ShieldAlert,
  Wrench,
  Clock,
  Calendar,
  Eye,
  SlidersHorizontal
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Reminders = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "warranty", "service"
  const [urgencyFilter, setUrgencyFilter] = useState("all"); // "all", "overdue", "soon", "safe"

  // Sync with the global search bar in Layout.jsx via Outlet Context
  const [searchTerm, setSearchTerm] = useOutletContext();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(res.data)) {
          setItems(res.data);
        } else if (Array.isArray(res.data?.items)) {
          setItems(res.data.items);
        } else if (Array.isArray(res.data?.data)) {
          setItems(res.data.data);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Error fetching items for reminders", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Dynamically generate warranty and service reminder logs
  const generateRemindersList = (itemsList) => {
    const reminders = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    itemsList.forEach((item) => {
      // 1. Warranty alert logic
      if (item.warrantyExpiry) {
        const expiryDate = new Date(item.warrantyExpiry);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        reminders.push({
          id: `w-${item._id}`,
          itemId: item._id,
          itemName: item.itemName || "Unnamed Asset",
          brand: item.brand || "N/A",
          category: item.category || "General",
          type: "warranty",
          date: item.warrantyExpiry,
          daysLeft: diffDays,
          urgency: diffDays < 0 ? "overdue" : diffDays <= 30 ? "soon" : "safe"
        });
      }

      // 2. Service/Maintenance alert logic
      const serviceDateStr = item.nextServiceDate || item.maintenanceDate;
      if (serviceDateStr) {
        const serviceDate = new Date(serviceDateStr);
        const diffTime = serviceDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        reminders.push({
          id: `s-${item._id}`,
          itemId: item._id,
          itemName: item.itemName || "Unnamed Asset",
          brand: item.brand || "N/A",
          category: item.category || "General",
          type: "service",
          date: serviceDateStr,
          daysLeft: diffDays,
          urgency: diffDays < 0 ? "overdue" : diffDays <= 7 ? "soon" : "safe"
        });
      }
    });

    // Sort: Overdue/Expired items are prioritized at the top of the timeline
    return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  const allReminders = generateRemindersList(items);

  // Search filter (Safe against null-pointer errors)
  const filteredReminders = allReminders.filter((rem) => {
    const itemNameStr = rem.itemName || "";
    const brandStr = rem.brand || "";

    const matchesSearch =
      itemNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || rem.type === typeFilter;
    const matchesUrgency = urgencyFilter === "all" || rem.urgency === urgencyFilter;

    return matchesSearch && matchesType && matchesUrgency;
  });

  // Calculate reminder urgency totals
  const totalOverdue = allReminders.filter((r) => r.urgency === "overdue").length;
  const totalDueSoon = allReminders.filter((r) => r.urgency === "soon").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Reminders Hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      {/* Main scrollable body area stretching 100% */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 w-full max-w-full">
        
        {/* Metric summary boxes using White base and Indigo/Slate accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-500/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue Alerts</p>
              <p className="text-xl font-bold text-red-600 mt-1 leading-none">{totalOverdue}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <ShieldAlert size={14} />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-500/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Soon / Expiring</p>
              <p className="text-xl font-bold text-amber-650 mt-1 leading-none">{totalDueSoon}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock size={14} />
            </div>
          </div>
        </div>

        {/* Dropdown Filter Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal size={12} className="text-slate-400 shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 bg-slate-50/50"
            >
              <option value="all">All Types</option>
              <option value="warranty">🛡️ Warranty Expiry</option>
              <option value="service">🔧 Maintenance Due</option>
            </select>
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 bg-slate-50/50"
          >
            <option value="all">All Urgency</option>
            <option value="overdue">⚠️ Overdue / Expired</option>
            <option value="soon">⏳ Due Soon</option>
            <option value="safe">✅ Safe</option>
          </select>
        </div>

        {/* Reminders List */}
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-150 rounded-2xl">
            <Bell className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 font-semibold text-xs">No reminders found matching the current filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((reminder) => {
              const isWarranty = reminder.type === "warranty";
              const overdue = reminder.urgency === "overdue";
              const soon = reminder.urgency === "soon";

              return (
                <div
                  key={reminder.id}
                  className={`bg-white rounded-xl border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5 transition-all duration-155 hover:shadow-xs ${
                    overdue ? "border-red-200 bg-red-50/10" : soon ? "border-amber-200 bg-amber-50/10" : "border-slate-150"
                  }`}
                >
                  {/* Left Side Details with Indigo/Slate Icons */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 shadow-xs">
                      {isWarranty ? <ShieldAlert size={14} /> : <Wrench size={14} />}
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-xs leading-snug">{reminder.itemName}</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Brand: {reminder.brand} • {reminder.category}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                          isWarranty ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}>
                          {isWarranty ? "Warranty Alert" : "Service Alert"}
                        </span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          overdue ? "bg-red-50 text-red-600 border-red-100" :
                          soon ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}>
                          {overdue ? "Overdue" : soon ? "Action Needed" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side Date Box and CTAs */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2 w-full sm:w-auto md:w-36">
                      <Calendar className="text-slate-400 shrink-0" size={14} />
                      <div className="text-[9px]">
                        <p className="font-bold text-slate-400 uppercase tracking-tight leading-none">Target Date</p>
                        <p className="font-bold text-slate-800 mt-1 leading-none text-[10px]">
                          {new Date(reminder.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      {/* Urgency message */}
                      <p className={`text-[10px] font-bold ${
                        overdue ? "text-red-600" : soon ? "text-amber-600" : "text-slate-400"
                      }`}>
                        {reminder.daysLeft < 0
                          ? `${isWarranty ? 'Expired' : 'Overdue'} ${Math.abs(reminder.daysLeft)} days ago`
                          : reminder.daysLeft === 0
                          ? "Today is the last day!"
                          : `${reminder.daysLeft} days remaining`}
                      </p>

                      {/* Detail view link styled in Premium Indigo */}
                      <Link
                        to={`/items/${reminder.itemId}`}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 font-bold p-2 rounded-lg transition shadow-xs flex items-center justify-center"
                        title="View Asset Details"
                      >
                        <Eye size={12} />
                      </Link>
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

export default Reminders;