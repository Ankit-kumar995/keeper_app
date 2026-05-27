import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { 
  Wrench, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  X
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Maintenance = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "overdue", "soon", "scheduled"
  
  // Sync with the global search bar in Layout.jsx via Outlet Context
  const [searchTerm, setSearchTerm] = useOutletContext();

  // States for updating maintenance/service date
  const [selectedItem, setSelectedItem] = useState(null);
  const [newServiceDate, setNewServiceDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Safely parse arrays from API response
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
      console.error("Error fetching items for maintenance", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Check if service date is overdue
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  };

  // Check if service date is due soon (next 7 days)
  const isDueSoon = (dateStr) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // Generate clear warning messages for overdue/scheduled days
  const getDaysMessage = (dateStr) => {
    if (!dateStr) return "No service date set";
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // API handler to schedule or log new service dates
  const handleUpdateServiceDate = async (e) => {
    e.preventDefault();
    if (!selectedItem || !newServiceDate) return;

    try {
      const token = localStorage.getItem("token");
      
      // Update nextServiceDate as defined in the DB collection design
      await axios.put(`${API_URL}/api/items/${selectedItem._id}`, {
        nextServiceDate: newServiceDate,
        maintenanceDate: newServiceDate // Backward compatibility fallback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModalOpen(false);
      setSelectedItem(null);
      setNewServiceDate("");
      fetchItems();
    } catch (err) {
      console.error("Failed to update service date", err);
      alert("Error updating service schedule. Please try again.");
    }
  };

  // Search and status filtering logic
  const filteredItems = items.filter((item) => {
    const serviceDate = item.nextServiceDate || item.maintenanceDate;
    const itemNameStr = item.itemName || "";
    const brandStr = item.brand || "";

    const matchesSearch =
      itemNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandStr.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "overdue") {
      matchesStatus = isOverdue(serviceDate);
    } else if (statusFilter === "soon") {
      matchesStatus = isDueSoon(serviceDate);
    } else if (statusFilter === "scheduled") {
      matchesStatus = serviceDate && !isOverdue(serviceDate) && !isDueSoon(serviceDate);
    } else if (statusFilter === "not_set") {
      matchesStatus = !serviceDate;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const overdueCount = items.filter(i => isOverdue(i.nextServiceDate || i.maintenanceDate)).length;
  const soonCount = items.filter(i => isDueSoon(i.nextServiceDate || i.maintenanceDate)).length;
  const totalScheduled = items.filter(i => (i.nextServiceDate || i.maintenanceDate)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Maintenance Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      {/* Scrollable content container */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 w-full max-w-full">
        
        {/* Metric summary boxes using White base and Indigo/Slate accents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-500/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue Services</p>
              <p className="text-xl font-bold text-red-600 mt-1 leading-none">{overdueCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
              <AlertTriangle size={14} />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-500/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Soon (7 Days)</p>
              <p className="text-xl font-bold text-amber-650 mt-1 leading-none">{soonCount}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Clock size={14} />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-500/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Scheduled</p>
              <p className="text-xl font-bold text-slate-800 mt-1 leading-none">{totalScheduled}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>

        {/* Dropdown Filter Panel */}
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-150 shadow-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filters</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 bg-slate-50/50"
          >
            <option value="all">All Service Status</option>
            <option value="overdue">⚠️ Overdue (Immediate Action)</option>
            <option value="soon">⏳ Due Soon (Next 7 Days)</option>
            <option value="scheduled">📅 Scheduled (Future)</option>
            <option value="not_set">❌ Date Not Scheduled</option>
          </select>
        </div>

        {/* Maintenance Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-150 rounded-2xl">
            <Wrench className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-slate-500 font-semibold text-xs">No assets found matching the selected maintenance status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filteredItems.map((item) => {
              const serviceDate = item.nextServiceDate || item.maintenanceDate;
              const overdue = isOverdue(serviceDate);
              const soon = isDueSoon(serviceDate);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs hover:shadow-sm hover:border-indigo-200/60 transition-all duration-155 flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-tight">{item.itemName}</h3>
                        <p className="text-[10px] text-slate-400 mt-1">{item.brand || "N/A"} • {item.category || "General"}</p>
                      </div>

                      {serviceDate ? (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md border uppercase tracking-wider ${
                          overdue ? "bg-red-50 text-red-600 border-red-100" :
                          soon ? "bg-amber-50 text-amber-600 border-amber-100" :
                          "bg-indigo-50 text-indigo-600 border border-indigo-100"
                        }`}>
                          {overdue ? "Overdue" : soon ? "Due Soon" : "Scheduled"}
                        </span>
                      ) : (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-150 uppercase tracking-wider">
                          No Schedule
                        </span>
                      )}
                    </div>

                    {/* Service Date Card */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2.5">
                      <Calendar className="text-slate-400 shrink-0" size={14} />
                      <div className="text-xs">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">Next Service Date</p>
                        <p className="font-bold text-slate-800 mt-1 leading-none text-[11px]">
                          {serviceDate ? new Date(serviceDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "Not Configured"}
                        </p>
                      </div>
                    </div>

                    {/* Warning days message */}
                    <p className={`text-[10px] font-semibold flex items-center gap-1 ${
                      overdue ? "text-red-600" : soon ? "text-amber-600" : "text-slate-400"
                    }`}>
                      {overdue && <AlertTriangle size={12} />}
                      {getDaysMessage(serviceDate)}
                    </p>
                  </div>

                  {/* Actions CTA Bar */}
                  <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <Link
                      to={`/items/${item._id}`}
                      className="text-[10px] font-bold text-slate-550 hover:text-indigo-600 transition"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setNewServiceDate(serviceDate ? new Date(serviceDate).toISOString().split('T')[0] : "");
                        setModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition"
                    >
                      {serviceDate ? "Log/Reschedule" : "Schedule Service"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Re-schedule Date Modal dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-sm w-full p-4 space-y-4 border border-slate-100 shadow-xl relative">
            
            <button
              onClick={() => { setModalOpen(false); setSelectedItem(null); }}
              className="absolute top-3.5 right-3.5 p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-sm font-bold text-slate-900">Manage Maintenance Schedule</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Set the next recommended maintenance date for this asset.</p>
            </div>

            {selectedItem && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] space-y-1">
                <p className="font-bold text-slate-850 leading-tight">{selectedItem.itemName}</p>
                <p className="text-slate-400 leading-none">Brand: {selectedItem.brand || "N/A"}</p>
              </div>
            )}

            <form onSubmit={handleUpdateServiceDate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  required
                  value={newServiceDate}
                  onChange={(e) => setNewServiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 bg-slate-50/50"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setSelectedItem(null); }}
                  className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 text-xs font-bold transition"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Maintenance;