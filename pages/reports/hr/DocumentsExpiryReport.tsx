import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, FileText, Calendar, Clock, 
  AlertTriangle, CheckCircle, XCircle, 
  RefreshCw, Download, X, User, Filter
} from "lucide-react";
import { Table, Column } from "../../../components/ui/Table";
import { Badge } from "../../../components/ui/Common";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const DocumentsExpiryReport: React.FC = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await hrService.getDocumentsExpiryReport();
      
      let documentsData = [];
      if (response?.data) {
        documentsData = response.data;
      } else if (response?.success && response?.data) {
        documentsData = response.data;
      } else if (Array.isArray(response)) {
        documentsData = response;
      } else {
        documentsData = [];
      }
      
      setDocuments(documentsData);
    } catch (error) {
      console.error("Error fetching documents expiry report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique document types
  const uniqueDocumentTypes = useMemo(() => {
    const types = documents.map(doc => doc.documentType).filter(Boolean);
    return Array.from(new Set(types));
  }, [documents]);

  // Apply filters
  const filteredData = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDocType = !documentTypeFilter || doc.documentType === documentTypeFilter;
      
      const daysRemaining = doc.daysRemaining || 0;
      let matchesStatus = true;
      if (statusFilter === "expired") matchesStatus = daysRemaining < 0;
      else if (statusFilter === "expiring_soon") matchesStatus = daysRemaining >= 0 && daysRemaining < 30;
      else if (statusFilter === "active") matchesStatus = daysRemaining >= 30;
      
      return matchesSearch && matchesDocType && matchesStatus;
    });
  }, [documents, searchTerm, documentTypeFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = documents.length;
    const expired = documents.filter(d => (d.daysRemaining || 0) < 0).length;
    const expiringSoon = documents.filter(d => (d.daysRemaining || 0) >= 0 && (d.daysRemaining || 0) < 30).length;
    const active = documents.filter(d => (d.daysRemaining || 0) >= 30).length;
    
    return { total, expired, expiringSoon, active };
  }, [documents]);

  const columns: Column<any>[] = [
    {
      header: t("employee"),
      render: (doc) => (
        <div className="flex items-center gap-3">
          {doc.avatar ? (
            <img 
              src={doc.avatar} 
              alt={doc.employeeName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {doc.employeeName}
            </span>
            <span className="text-xs text-gray-500">
              {doc.employeeCode}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("document_type"),
      render: (doc) => (
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-500" />
          <span className="text-sm text-gray-700">{doc.documentType}</span>
        </div>
      )
    },
    {
      header: t("document_number"),
      render: (doc) => (
        <span className="text-sm text-gray-600 font-mono">
          {doc.documentNumber || "-"}
        </span>
      )
    },
    {
      header: t("expiry_date"),
      render: (doc) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700">{doc.expiryDate}</span>
        </div>
      )
    },
    {
      header: t("days_remaining"),
      render: (doc) => {
        const days = doc.daysRemaining || 0;
        let colorClass = "text-gray-600";
        if (days < 0) colorClass = "text-red-600 font-bold";
        else if (days < 30) colorClass = "text-orange-600 font-semibold";
        else colorClass = "text-green-600";
        
        return (
          <div className="flex items-center gap-1.5">
            <Clock size={14} className={days < 0 ? "text-red-400" : days < 30 ? "text-orange-400" : "text-green-400"} />
            <span className={`text-sm ${colorClass}`}>
              {Math.abs(days)} {t("days")} {days < 0 ? t("ago") : t("remaining")}
            </span>
          </div>
        );
      }
    },
    {
      header: t("status"),
      render: (doc) => {
        const days = doc.daysRemaining || 0;
        let variant: "danger" | "warning" | "success" = "success";
        let icon = null;
        let label = "";
        
        if (days < 0) {
          variant = "danger";
          icon = <XCircle size={14} className="mr-1" />;
          label = t("expired");
        } else if (days < 30) {
          variant = "warning";
          icon = <AlertTriangle size={14} className="mr-1" />;
          label = t("expiring_soon");
        } else {
          variant = "success";
          icon = <CheckCircle size={14} className="mr-1" />;
          label = t("active");
        }
        
        return (
          <Badge variant={variant} className="flex items-center">
            {icon}
            {label}
          </Badge>
        );
      }
    },
  ];

  const documentTypeOptions = [
    { value: "", label: t("all_document_types") },
    ...uniqueDocumentTypes.map(type => ({ value: type, label: type })),
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "expired", label: t("expired") },
    { value: "expiring_soon", label: t("expiring_soon") },
    { value: "active", label: t("active") },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setDocumentTypeFilter("");
    setStatusFilter("");
  };

  const hasFilters = searchTerm || documentTypeFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("documents_expiry_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_employee_documents_nearing_expiration")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={18} />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_documents")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Active Documents Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("active_documents")}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("expiring_soon")}
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Expired Documents Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">
                {t("expired_documents")}
              </p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {stats.expired}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
              <XCircle size={20} className="text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner if there are expiring or expired documents */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className={`rounded-xl p-4 ${stats.expired > 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={stats.expired > 0 ? "text-red-600" : "text-orange-600"} size={20} />
            <div>
              <h3 className={`font-medium ${stats.expired > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                {stats.expired > 0 
                  ? t("attention_expired_documents")
                  : t("attention_expiring_documents")}
              </h3>
              <p className={`text-sm mt-1 ${stats.expired > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {stats.expired > 0
                  ? t("expired_documents_warning", { count: stats.expired })
                  : t("expiring_documents_warning", { count: stats.expiringSoon })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Search Input */}
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_employee")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Document Type Filter */}
          <div className="relative min-w-[150px]">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={documentTypeFilter}
              onChange={(e) => setDocumentTypeFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {documentTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[130px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
              {t("clear_filters")}
            </button>
          )}
        </div>

        {/* Filter Stats */}
        {hasFilters && filteredData.length !== documents.length && (
          <div className="text-sm text-gray-500">
            {t("showing")} {filteredData.length} {t("of")} {documents.length} {t("documents")}
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        columns={columns}
        keyExtractor={(item, index) => `${item.employeeCode}-${item.documentType}-${index}`}
        isLoading={isLoading}
        selectable
        emptyMessage={t("no_documents_found")}
      />

      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("no_documents_available")}
          </h3>
          <p className="text-gray-500">
            {t("no_documents_description")}
          </p>
        </div>
      )}
    </div>
  );
};