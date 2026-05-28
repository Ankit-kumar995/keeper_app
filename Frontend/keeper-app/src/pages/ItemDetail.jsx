import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, FileText, ShieldCheck, Tag, Image as ImageIcon,
  ArrowLeft, X, Download, Maximize2, ExternalLink, AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const getDocUrl = (url) => {
  if (!url || url === "null" || url === "undefined" || url.trim() === "") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  let sanitizedUrl = url.replace(/\\/g, "/");
  if (sanitizedUrl.includes("uploads/")) {
    const index = sanitizedUrl.indexOf("uploads/");
    sanitizedUrl = sanitizedUrl.slice(index);
  } else {
    sanitizedUrl = `uploads/${sanitizedUrl.startsWith("/") ? sanitizedUrl.slice(1) : sanitizedUrl}`;
  }
  return `${API_URL}${sanitizedUrl.startsWith("/") ? "" : "/"}${sanitizedUrl}`;
};

const isPdf = (url) => url?.toLowerCase().includes(".pdf");
const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);

// ─────────────────────────────────────────────────────────────────────────────
// In-App Document Viewer Modal — no browser navigation
// ─────────────────────────────────────────────────────────────────────────────
const DocViewerModal = ({ label, url, onClose }) => {
  const resolvedUrl = getDocUrl(url);
  const pdf = isPdf(resolvedUrl);
  const image = isImage(resolvedUrl);
  const [imgError, setImgError] = useState(false);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1030] border-b border-violet-900/50 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">

          {/* ✅ Back Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-violet-200 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg bg-violet-800/60 border border-violet-700 hover:bg-violet-700 active:bg-violet-900 transition-all duration-150 shrink-0"
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <div className="w-px h-5 bg-violet-800 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-md bg-violet-900 border border-violet-700 text-violet-300 flex items-center justify-center shrink-0">
              <FileText size={13} />
            </div>
            <p className="text-white font-bold text-xs truncate">{label}</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-violet-400 hover:text-white text-[10px] font-bold px-2 py-1.5 rounded-lg border border-violet-800 hover:border-violet-500 hover:bg-violet-900/50 transition-all duration-150"
            title="Open in new tab"
          >
            <Maximize2 size={11} />
            <span className="hidden sm:inline">Full Screen</span>
          </a>
          <a
            href={resolvedUrl}
            download
            className="flex items-center gap-1 text-violet-400 hover:text-white text-[10px] font-bold px-2 py-1.5 rounded-lg border border-violet-800 hover:border-violet-500 hover:bg-violet-900/50 transition-all duration-150"
            title="Download"
          >
            <Download size={11} />
            <span className="hidden sm:inline">Download</span>
          </a>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-violet-800 text-violet-400 hover:text-red-400 hover:border-red-800 hover:bg-red-950/30 transition-all duration-150"
            title="Close (Esc)"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Preview Body */}
      <div className="flex-1 overflow-auto bg-[#0d0818] flex items-start justify-center p-4">
        {!resolvedUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-violet-600 gap-3">
            <AlertCircle size={40} className="opacity-30" />
            <p className="text-sm font-semibold">No document URL available.</p>
          </div>
        ) : pdf ? (
          <iframe
            src={resolvedUrl}
            title={label}
            className="w-full rounded-lg border border-violet-900/30 shadow-2xl"
            style={{ minHeight: "calc(100vh - 120px)", height: "100%" }}
          />
        ) : image && !imgError ? (
          <img
            src={resolvedUrl}
            alt={label}
            className="max-w-full rounded-xl shadow-2xl border border-violet-900/20"
            style={{ maxHeight: "calc(100vh - 140px)", objectFit: "contain" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-violet-500 py-16">
            <FileText size={52} className="opacity-20" />
            <div className="text-center">
              <p className="text-sm font-bold text-violet-300 mb-1">
                {imgError ? "Image could not be loaded." : "Preview not available for this file type."}
              </p>
              <p className="text-[11px] text-violet-600">Use the buttons above to open or download.</p>
            </div>
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-violet-700 hover:bg-violet-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition mt-2"
            >
              <ExternalLink size={13} /> Open in New Tab
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ItemDetail Page
// ─────────────────────────────────────────────────────────────────────────────
const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state: { label, url } or null
  const [viewingDoc, setViewingDoc] = useState(null);

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
  }, [id, user]);

  const getProductImage = () => {
    let rawUrl = item?.productImageUrl || item?.imageUrl || item?.productImage || item?.image || "";
    if (!rawUrl && item?.documents && Array.isArray(item.documents)) {
      const foundImg = item.documents.find((d) => d && (d.name === "productImage" || d.type === "productImage"));
      if (foundImg) rawUrl = foundImg.url;
    }
    if (!rawUrl || rawUrl === "null" || rawUrl === "undefined" || rawUrl.trim() === "") return "";
    if (rawUrl.includes("drive.google.com")) {
      const match = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    let sanitizedUrl = rawUrl.replace(/\\/g, "/");
    if (sanitizedUrl.startsWith("http://") || sanitizedUrl.startsWith("https://") || sanitizedUrl.startsWith("data:")) return sanitizedUrl;
    if (sanitizedUrl.includes("uploads/")) {
      const index = sanitizedUrl.indexOf("uploads/");
      sanitizedUrl = sanitizedUrl.slice(index);
    } else {
      sanitizedUrl = `uploads/${sanitizedUrl.startsWith("/") ? sanitizedUrl.slice(1) : sanitizedUrl}`;
    }
    if (sanitizedUrl === "undefined" || sanitizedUrl === "null") return "";
    return `${API_URL}${sanitizedUrl.startsWith("/") ? "" : "/"}${sanitizedUrl}`;
  };

  const getDoc = (type) => {
    if (!item?.documents || !Array.isArray(item.documents)) return null;
    const found = item.documents.find((d) => d && (d.name === type || d.type === type));
    if (found && found.url) return found.url;
    if (type === "invoice" && typeof item.documents[0] === "string") return item.documents[0];
    if (type === "warrantyCard" && typeof item.documents[1] === "string") return item.documents[1];
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4fa] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading asset details...</span>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-16 text-slate-500 text-xs">
        Asset not found.
        <button onClick={() => navigate("/items")} className="block mx-auto mt-3 text-violet-600 font-bold hover:underline">
          Go back to Vault
        </button>
      </div>
    );
  }

  const isExpired = item.warrantyExpiry && new Date(item.warrantyExpiry) < new Date();
  const productImage = getProductImage();

  const docTypes = [
    { type: "invoice",      label: "Purchase Invoice" },
    { type: "warrantyCard", label: "Warranty Card"     },
  ];

  return (
    <>
      {/* ✅ In-App Viewer Modal — renders over everything */}
      {viewingDoc && (
        <DocViewerModal
          label={viewingDoc.label}
          url={viewingDoc.url}
          onClose={() => setViewingDoc(null)}
        />
      )}

      <div className="w-full m-0 bg-[#f5f4fa] text-slate-900 font-sans flex flex-col">
        <div className="flex-1 p-4 lg:p-6 space-y-5 w-full max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── Main Details Card ── */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 lg:col-span-2 shadow-xs space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] font-bold uppercase bg-violet-50 text-violet-600 border border-violet-100 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
                    <Tag size={10} /> {item.category || "N/A"}
                  </span>
                  <h1 className="text-lg font-bold text-slate-900 mt-2.5 leading-none">{item.itemName}</h1>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Brand: {item.brand || "N/A"}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                }`}>
                  {isExpired ? "Warranty Expired" : "Warranty Active"}
                </span>
              </div>

              {/* Product Image */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-slate-400" /> Product Image
                </h3>
                <div className="w-full h-52 rounded-2xl bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center p-2">
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

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-y border-gray-100 py-4">
                {[
                  { icon: Calendar,     label: "Purchase Date",       value: item.purchaseDate   },
                  { icon: ShieldCheck,  label: "Warranty Expiration", value: item.warrantyExpiry },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shadow-xs shrink-0">
                      <Icon size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-none">{label}</p>
                      <p className="text-xs font-bold text-slate-800 mt-1">
                        {value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-800">Notes & Description</h3>
                <div className="text-[11px] text-slate-600 bg-gray-50 p-4 rounded-xl border border-gray-150 leading-relaxed whitespace-pre-line">
                  {item.notes || "No extra descriptions added."}
                </div>
              </div>
            </div>

            {/* ── Documents Folder Card ── */}
            <div className="space-y-4 col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs h-fit space-y-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
                    <FileText size={12} />
                  </div>
                  Documents Folder
                </h2>

                <div className="space-y-2.5">
                  {docTypes.map(({ type, label }) => {
                    const docUrl = getDoc(type);
                    return (
                      <div key={type} className="p-3 border border-gray-100 rounded-lg bg-gray-50/50 space-y-2">
                        <p className="text-[9px] font-bold uppercase text-slate-400 leading-none">
                          {label}
                        </p>
                        {docUrl ? (
                          // ✅ button — opens in-app modal, NEVER navigates browser
                          <button
                            onClick={() => setViewingDoc({ label, url: docUrl })}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 px-3 py-1.5 rounded-lg transition shadow-sm shadow-violet-100 w-full justify-center"
                          >
                            <FileText size={11} />
                            View {label}
                          </button>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Not uploaded</p>
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
    </>
  );
};

export default ItemDetail;