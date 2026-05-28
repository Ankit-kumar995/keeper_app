import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useOutletContext } from "react-router-dom";
import {
  FileText,
  Tag,
  SlidersHorizontal,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  X,
  ArrowLeft,
  Download,
  Maximize2,
  Eye,
  AlertCircle
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
// DocViewerModal — fully in-app, no browser navigation
// ─────────────────────────────────────────────────────────────────────────────
export const DocViewerModal = ({ doc, onClose }) => {
  const resolvedUrl = getDocUrl(doc.url);
  const pdf = isPdf(resolvedUrl);
  const image = isImage(resolvedUrl);
  const [imgError, setImgError] = useState(false);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* ── Modal Header ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1030] border-b border-violet-900/50 shrink-0 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">

          {/* ✅ BACK BUTTON — clearly visible */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-violet-200 hover:text-white text-[11px] font-bold px-3 py-1.5 rounded-lg bg-violet-800/60 border border-violet-700 hover:bg-violet-700 transition-all duration-150 shrink-0"
          >
            <ArrowLeft size={13} />
            Back
          </button>

          <div className="w-px h-5 bg-violet-800 shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-md flex items-center justify-center border shrink-0 ${
              doc.docType === "invoice"
                ? "bg-violet-900 border-violet-700 text-violet-300"
                : "bg-purple-900 border-purple-700 text-purple-300"
            }`}>
              {doc.docType === "invoice" ? <FileSpreadsheet size={13} /> : <ShieldCheck size={13} />}
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-xs leading-tight truncate">{doc.docLabel}</p>
              <p className="text-violet-500 text-[9px] truncate">{doc.itemName} · {doc.brand}</p>
            </div>
          </div>
        </div>

        {/* Right-side actions */}
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
            title="Download file"
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

      {/* ── Document Preview Body ── */}
      <div className="flex-1 overflow-auto bg-[#0d0818] flex items-start justify-center p-4">
        {!resolvedUrl ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-violet-600 gap-3">
            <AlertCircle size={40} className="opacity-30" />
            <p className="text-sm font-semibold">No document URL available.</p>
          </div>

        ) : pdf ? (
          // PDF → use iframe, fills full modal
          <iframe
            src={resolvedUrl}
            title={doc.docLabel}
            className="w-full rounded-lg border border-violet-900/30 shadow-2xl"
            style={{ minHeight: "calc(100vh - 120px)", height: "100%" }}
          />

        ) : image && !imgError ? (
          // Image → centered, max size, scrollable if tall
          <img
            src={resolvedUrl}
            alt={doc.docLabel}
            className="max-w-full rounded-xl shadow-2xl border border-violet-900/20"
            style={{ maxHeight: "calc(100vh - 140px)", objectFit: "contain" }}
            onError={() => setImgError(true)}
          />

        ) : (
          // Fallback for unknown/broken file types
          <div className="flex flex-col items-center justify-center h-full gap-4 text-violet-500 py-16">
            <FileText size={52} className="opacity-20" />
            <div className="text-center">
              <p className="text-sm font-bold text-violet-300 mb-1">
                {imgError ? "Image could not be loaded." : "Preview not available for this file type."}
              </p>
              <p className="text-[11px] text-violet-600">Use the buttons above to open or download the file.</p>
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
// Main Documents Page
// ─────────────────────────────────────────────────────────────────────────────
const Documents = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [viewingDoc, setViewingDoc] = useState(null);

  const [searchTerm] = useOutletContext();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/items`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (Array.isArray(res.data)) setItems(res.data);
        else if (Array.isArray(res.data?.items)) setItems(res.data.items);
        else if (Array.isArray(res.data?.data)) setItems(res.data.data);
        else setItems([]);
      } catch (err) {
        console.error("Error fetching items for documents", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [user]);

  const extractAllDocuments = (itemsList) => {
    const docList = [];
    itemsList.forEach((item) => {
      if (item.documents && Array.isArray(item.documents)) {
        item.documents.forEach((doc, idx) => {
          if (typeof doc === "string") {
            const isInvoice = idx === 0;
            docList.push({
              id: `${item._id}-doc-${idx}`,
              itemId: item._id,
              itemName: item.itemName || "Unnamed Asset",
              brand: item.brand || "N/A",
              docType: isInvoice ? "invoice" : "warrantyCard",
              docLabel: isInvoice ? "Purchase Invoice" : "Warranty Card",
              url: doc,
              createdAt: item.createdAt
            });
          } else if (doc && typeof doc === "object") {
            const type = doc.name || doc.type || "other";
            docList.push({
              id: doc._id || `${item._id}-doc-${idx}`,
              itemId: item._id,
              itemName: item.itemName || "Unnamed Asset",
              brand: item.brand || "N/A",
              docType: type,
              docLabel: type === "invoice" ? "Purchase Invoice" : type === "warrantyCard" ? "Warranty Card" : "Attachment",
              url: doc.url || "",
              createdAt: doc.uploadedAt || item.createdAt
            });
          }
        });
      }
    });
    return docList;
  };

  const allDocuments = extractAllDocuments(items);

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      (doc.itemName || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (doc.brand || "").toLowerCase().includes((searchTerm || "").toLowerCase()) ||
      (doc.docLabel || "").toLowerCase().includes((searchTerm || "").toLowerCase());
    const matchesType = docTypeFilter === "all" || doc.docType === docTypeFilter;
    return matchesSearch && matchesType;
  });

  const totalInvoices = allDocuments.filter((d) => d.docType === "invoice").length;
  const totalWarranties = allDocuments.filter((d) => d.docType === "warrantyCard").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4fa] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Document Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Modal renders over everything — no browser navigation */}
      {viewingDoc && (
        <DocViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      <div className="w-full m-0 bg-[#f5f4fa] text-slate-900 font-sans flex flex-col">
        <div className="flex-1 p-4 lg:p-6 space-y-5 w-full max-w-full">

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            {[
              { label: "Total Files", value: allDocuments.length, icon: FileText, color: "violet" },
              { label: "Purchase Invoices", value: totalInvoices, icon: FileSpreadsheet, color: "violet" },
              { label: "Warranty Cards", value: totalWarranties, icon: ShieldCheck, color: "purple" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-${color}-200 transition duration-150`}>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-bold text-slate-800 mt-1 leading-none">{value}</p>
                </div>
                <div className={`w-8 h-8 rounded-lg bg-${color}-50 text-${color}-600 flex items-center justify-center border border-${color}-100`}>
                  <Icon size={14} />
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-xs">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filters</span>
            </div>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-violet-500/15 focus:border-violet-500 bg-gray-50/50"
            >
              <option value="all">All Documents</option>
              <option value="invoice">🧾 Purchase Invoices</option>
              <option value="warrantyCard">🛡️ Warranty Cards</option>
              <option value="other">📎 Other Attachments</option>
            </select>
          </div>

          {/* Document Cards Grid */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
              <FileText className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-500 font-semibold text-xs">No attachments found matching the filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {filteredDocuments.map((doc) => {
                const isInvoice = doc.docType === "invoice";
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md hover:border-violet-200 transition-all duration-150 flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-3.5">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isInvoice ? "bg-violet-50 border-violet-100 text-violet-600" : "bg-purple-50 border-purple-100 text-purple-600"
                        }`}>
                          {isInvoice ? <FileSpreadsheet size={14} /> : <ShieldCheck size={14} />}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                            {isInvoice ? "Invoice" : "Warranty Card"}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs leading-tight">{doc.docLabel}</h3>
                          <p className="text-[10px] text-slate-400 truncate">Parent Asset: {doc.itemName}</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Brand / Category:</span>
                        <span className="font-bold text-slate-700 flex items-center gap-1">
                          <Tag size={10} className="text-slate-400" /> {doc.brand}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-gray-50/60 px-4 py-2.5 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0">
                      <Link
                        to={`/items/${doc.itemId}`}
                        className="text-[10px] font-bold text-slate-500 hover:text-violet-600 transition"
                      >
                        View Parent Asset
                      </Link>

                      {doc.url ? (
                        // ✅ Single prominent button — opens IN-APP modal, never navigates browser
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition shadow-sm shadow-violet-200"
                        >
                          <Eye size={11} />
                          View Document
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No file attached</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Documents;