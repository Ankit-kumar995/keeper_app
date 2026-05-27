import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  FileText,
  Tag,
  Eye,
  SlidersHorizontal,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Documents = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docTypeFilter, setDocTypeFilter] = useState("all");

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
        console.error("Error fetching items for documents", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

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
    const itemNameStr = doc.itemName || "";
    const brandStr = doc.brand || "";
    const docLabelStr = doc.docLabel || "";

    const matchesSearch =
      itemNameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      docLabelStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = docTypeFilter === "all" || doc.docType === docTypeFilter;

    return matchesSearch && matchesType;
  });

  const totalInvoices = allDocuments.filter((d) => d.docType === "invoice").length;
  const totalWarranties = allDocuments.filter((d) => d.docType === "warrantyCard").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-[#f9f9fb] w-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[10px] tracking-wider text-slate-400">Loading Document Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full m-0 bg-[#fafafc] text-slate-900 font-sans flex flex-col">
      
      {/* Main scrollable body area stretching 100% */}
      <div className="flex-1 p-4 lg:p-6 space-y-5 w-full max-w-full">
        
        {/* Quick metrics cards mapped with the Slate & Indigo theme */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-550/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Files</p>
              <p className="text-xl font-bold text-slate-800 mt-1 leading-none">{allDocuments.length}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileText size={14} />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-550/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Purchase Invoices</p>
              <p className="text-xl font-bold text-slate-800 mt-1 leading-none">{totalInvoices}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileSpreadsheet size={14} />
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-4 flex items-center justify-between shadow-xs hover:border-indigo-550/30 transition duration-155">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warranty Cards</p>
              <p className="text-xl font-bold text-slate-800 mt-1 leading-none">{totalWarranties}</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <ShieldCheck size={14} />
            </div>
          </div>
        </div>

        {/* Filter panel dropdown toolbar */}
        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-150 shadow-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filters</span>
          </div>
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-4 focus:ring-indigo-600/15 focus:border-indigo-600 bg-slate-50/50"
          >
            <option value="all">All Documents</option>
            <option value="invoice">🧾 Purchase Invoices</option>
            <option value="warrantyCard">🛡️ Warranty Cards</option>
            <option value="other">📎 Other Attachments</option>
          </select>
        </div>

        {/* Document Cards Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-150 rounded-2xl">
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
                  className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-xs hover:shadow-sm hover:border-indigo-200/60 transition-all duration-155 flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3.5">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isInvoice
                          ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}>
                        {isInvoice ? <FileSpreadsheet size={14} /> : <ShieldCheck size={14} />}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                          {isInvoice ? "Invoice" : "Warranty Card"}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs leading-tight">
                          {doc.docLabel}
                        </h3>
                        <p className="text-[10px] text-slate-400">Parent Asset: {doc.itemName}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Brand / Category:</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Tag size={10} className="text-slate-400" /> {doc.brand}
                      </span>
                    </div>
                  </div>

                  {/* Document CTAs */}
                  <div className="bg-slate-50/50 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
                    <Link
                      to={`/items/${doc.itemId}`}
                      className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition"
                    >
                      View Parent Asset
                    </Link>

                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                      >
                        Google Drive <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400">Broken Link</span>
                    )}
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

export default Documents;