import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, FileText, ExternalLink, ShieldCheck, Tag, Image as ImageIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItem(res.data);
      } catch (err) {
        console.error("Failed to fetch item details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id]);

  const getProductImage = () => {
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

  const getDoc = (type) => {
    if (!item?.documents || !Array.isArray(item.documents)) return null;

    const found = item.documents.find(
      (d) => d && (d.name === type || d.type === type)
    );
    if (found && found.url) return found.url;

    if (type === "invoice" && typeof item.documents[0] === "string") {
      return item.documents[0];
    }
    if (type === "warrantyCard" && typeof item.documents[1] === "string") {
      return item.documents[1];
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading asset details...</span>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Asset not found.
        <button onClick={() => navigate("/items")} className="block mx-auto mt-3 text-indigo-600 font-bold hover:text-indigo-500 hover:underline">
          Go back to Vault
        </button>
      </div>
    );
  }

  const isExpired = item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date();
  const productImage = getProductImage();

  console.log("DEBUG: Generated Image URL -> ", productImage);

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      <div className="flex-1 p-4 lg:p-6 space-y-5 w-full max-w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Main Details */}
          <div className="bg-white rounded-xl border border-slate-150 p-4 md:p-5 lg:col-span-2 shadow-xs space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-600 border border-indigo-150 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                  <Tag size={10} /> {item.category || "N/A"}
                </span>
                <h1 className="text-lg font-bold text-slate-900 mt-2.5 leading-none">{item.itemName}</h1>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Brand: {item.brand || "N/A"}</p>
              </div>
              
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}>
                {isExpired ? "Warranty Expired" : "Warranty Active"}
              </span>
            </div>

            {/* Product Image Showcase Container */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ImageIcon size={12} className="text-slate-400" /> Product Image
              </h3>
              <div className="w-full h-52 rounded-2xl bg-slate-50 border border-slate-150 overflow-hidden flex items-center justify-center p-2">
                {productImage && !productImage.endsWith("/undefined") && !productImage.endsWith("/null") ? (
                  <img 
                    src={productImage} 
                    alt={item.itemName} 
                    className="max-h-44 rounded-xl object-contain shadow-xs" 
                    onError={(e) => { 
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=60"; 
                    }} 
                  />
                ) : (
                  <div className="text-slate-400 text-[10px] text-center font-semibold flex flex-col items-center gap-1.5">
                    <ImageIcon size={18} className="text-slate-300" />
                    <span>No product image uploaded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase and Expiration dates grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-150 shadow-xs shrink-0">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none">Purchase Date</p>
                  <p className="text-xs font-bold text-slate-850 mt-1">
                    {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-150 shadow-xs shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none">Warranty Expiration</p>
                  <p className="text-xs font-bold text-slate-850 mt-1">
                    {item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes & Description Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-850">Notes & Description</h3>
              <div className="text-[11px] text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-150 leading-relaxed whitespace-pre-line">
                {item.notes || "No extra descriptions added."}
              </div>
            </div>
          </div>

          {/* Attached Documents Folder Card */}
          <div className="space-y-4 col-span-1">
            <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-xs h-fit space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-150">
                  <FileText size={12} />
                </div>
                Documents Folder
              </h2>

              <div className="space-y-2.5">
                {['invoice', 'warrantyCard'].map((docType) => {
                  const docUrl = getDoc(docType);
                  return (
                    <div key={docType} className="p-3 border border-slate-150 rounded-lg bg-slate-50/50">
                      <p className="text-[9px] font-bold uppercase text-slate-400 mb-1.5 leading-none">
                        {docType.replace(/([A-Z])/g, ' $1')}
                      </p>
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                          View Document <ExternalLink size={10} />
                        </a>
                      ) : (
                        <p className="text-[10px] text-slate-400">Not uploaded</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;