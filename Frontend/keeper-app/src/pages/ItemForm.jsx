import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";

// Define the backend API base URL using Vite environment variables with a localhost fallback
const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api/items`;

const ItemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Retrieve the secure authorization token from localStorage
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    itemName: "",
    brand: "",
    category: "Electronics",
    purchaseDate: "",
    warrantyExpiry: "",
    nextServiceDate: "",
    notes: "",
  });

  const [warrantyCard, setWarrantyCard] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [productImage, setProductImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const item = res.data;
          setFormData({
            itemName: item.itemName || "",
            brand: item.brand || "",
            category: item.category || "Electronics",
            purchaseDate: item.purchaseDate ? item.purchaseDate.substring(0, 10) : "",
            warrantyExpiry: item.warrantyExpiry ? item.warrantyExpiry.substring(0, 10) : "",
            nextServiceDate: item.nextServiceDate ? item.nextServiceDate.substring(0, 10) : "",
            notes: item.notes || "",
          });
        } catch (err) {
          console.error("Failed to fetch item data", err);
        }
      };
      fetchItem();
    }
  }, [id, isEditMode, token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, setFile) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be under 5MB!");
        e.target.value = null;
        return;
      }
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (warrantyCard)  data.append("warrantyCard", warrantyCard);
    if (invoice)       data.append("invoice", invoice);
    if (productImage)  data.append("productImage", productImage);

    try {
      const config = {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      };

      if (isEditMode) {
        await axios.put(`${API_BASE_URL}/${id}`, data, config);
      } else {
        await axios.post(API_BASE_URL, data, config);
      }
      navigate("/items");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong during saving.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      {/* Scrollable content container stretching 100% */}
      <div className="flex-1 p-4 lg:p-6 space-y-4 w-full max-w-full">
        <div className="max-w-3xl mx-auto">
          
          <div className="bg-white rounded-xl border border-slate-150 p-4 md:p-5 shadow-xs">

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-100 text-red-700 text-[11px] rounded-lg font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Item Name *</label>
                  <input type="text" name="itemName" value={formData.itemName} onChange={handleInputChange} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Brand *</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors">
                    <option value="Electronics">Electronics</option>
                    <option value="Kitchen Appliances">Kitchen Appliances</option>
                    <option value="Home Comfort">Home Comfort (AC, Heater)</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Purchase Date</label>
                  <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Warranty Expiration Date</label>
                  <input type="date" name="warrantyExpiry" value={formData.warrantyExpiry} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Next Service Schedule Date</label>
                  <input type="date" name="nextServiceDate" value={formData.nextServiceDate} onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Notes & Descriptions</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 hover:border-slate-300 transition-colors" />
              </div>

              {/* Document upload fields */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Upload Documents (Max 5MB each, PDF/JPG/PNG)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="space-y-1 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Image</label>
                    <input type="file" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, setProductImage)}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer transition" />
                  </div>
                  
                  <div className="space-y-1 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Warranty Card</label>
                    <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={(e) => handleFileChange(e, setWarrantyCard)}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer transition" />
                  </div>
                  
                  <div className="space-y-1 p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Purchase Invoice</label>
                    <input type="file" accept="image/png, image/jpeg, application/pdf" onChange={(e) => handleFileChange(e, setInvoice)}
                      className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer transition" />
                  </div>

                </div>
              </div>

              {/* Submit button with Indigo background and white text */}
              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition border border-indigo-700 shadow-xs disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300">
                <Save size={14} /> {submitting ? "Saving & Uploading to Google Drive..." : "Save Asset"}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItemForm;