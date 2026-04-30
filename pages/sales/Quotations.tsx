import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Eye, FileText, Calendar, User, DollarSign, Filter, X, Package } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { QuotationModal } from "../../components/sales/QuotationModal";
import { useData } from "../../context/DataContext";
import { Quotation } from "../../types";
import { toast } from "sonner";

export const Quotations: React.FC = () => {
  const { t } = useTranslation();
  const { quotations, addQuotation, updateQuotation, deleteQuotation, customers } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (quotation: Partial<Quotation>) => {
    try {
      setIsLoading(true);
      if (editingQuotation) {
        await updateQuotation({ ...quotation, id: editingQuotation.id, _id: editingQuotation._id } as Quotation);
        toast.success(t("quotation_updated_successfully"));
      } else {
        await addQuotation(quotation as Quotation);
        toast.success(t("quotation_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingQuotation(null);
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error(t("failed_to_save_quotation"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteQuotation(deleteId);
        toast.success(t("quotation_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_quotation"));
      }
    }
  }, [deleteId, deleteQuotation, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteQuotation(id)));
      toast.success(t("quotations_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_quotations"));
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomerName = (quotation: Quotation) => {
    if (typeof quotation.customerId === "object" && quotation.customerId !== null) {
      return (quotation.customerId as any).customerName;
    }
    const customer = customers.find(c => (c._id || c.id) === quotation.customerId);
    return customer?.customerName || "N/A";
  };

  // Apply filters
  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const customerName = getCustomerName(q).toLowerCase();
      const quotationNo = q.quotationNo || "";
      const matchesSearch = quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || q.status === statusFilter;
      const matchesCustomer = !customerFilter || 
        (typeof q.customerId === "object" ? (q.customerId as any)._id === customerFilter : q.customerId === customerFilter);
      
      const quotationDate = new Date(q.quotationDate);
      const matchesDateFrom = !dateFrom || quotationDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || quotationDate <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [quotations, searchTerm, statusFilter, customerFilter, dateFrom, dateTo]);

  // Statistics
  const totalQuotations = filteredQuotations.length;
  const totalValue = filteredQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);
  const draftCount = filteredQuotations.filter(q => q.status === "DRAFT").length;
  const sentCount = filteredQuotations.filter(q => q.status === "SENT").length;
  const expiredCount = filteredQuotations.filter(q => q.status === "EXPIRED").length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info"; label: string }> = {
      DRAFT: { variant: "warning", label: t("draft") },
      SENT: { variant: "success", label: t("sent") },
      EXPIRED: { variant: "danger", label: t("expired") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "DRAFT", label: t("draft") },
    { value: "SENT", label: t("sent") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const customerOptions = [
    { value: "", label: t("all_customers") },
    ...customers.map(c => ({ value: c._id || c.id, label: c.customerName }))
  ];

  const columns: Column<Quotation>[] = useMemo(
    () => [
      {
        header: t("quotation_no"),
        accessorKey: "quotationNo",
        render: (q) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{q.quotationNo}</span>
            <span className="text-xs text-gray-500">{formatDate(q.quotationDate)}</span>
          </div>
        )
      },
      {
        header: t("customer"),
        render: (q) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{getCustomerName(q)}</span>
            </div>
            {q.expirationDate && (
              <span className="text-xs text-gray-400 mt-0.5">
                {t("expires")}: {formatDate(q.expirationDate)}
              </span>
            )}
          </div>
        )
      },
      {
        header: t("items"),
        render: (q) => (
          <div className="flex flex-col gap-0.5">
            {q.items?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Package size={12} className="text-gray-400" />
                <span className="text-gray-600">{item.productName || item.sku}</span>
                <span className="text-gray-400">x{item.qty}</span>
              </div>
            ))}
            {q.items && q.items.length > 2 && (
              <span className="text-xs text-gray-400">+{q.items.length - 2} more</span>
            )}
          </div>
        )
      },
      {
        header: t("amount"),
        render: (q) => (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-600">{q.totalAmount?.toLocaleString()} EGP</span>
            <span className="text-xs text-gray-400">{t("subtotal")}: {q.subtotal?.toLocaleString()}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (q) => getStatusBadge(q.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (q) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(q)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(q._id || q.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("quotations")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_quotations")}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredQuotations} filename="quotations" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingQuotation(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_quotation")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_quotations")}</p>
          <p className="text-xl font-bold text-gray-900">{totalQuotations}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_value")}</p>
          <p className="text-xl font-bold text-indigo-600">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("draft")}</p>
          <p className="text-xl font-bold text-orange-600">{draftCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("sent")}</p>
          <p className="text-xl font-bold text-green-600">{sentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("expired")}</p>
          <p className="text-xl font-bold text-red-600">{expiredCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_quotations")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {customerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder={t("from_date")}
          className="w-36"
          fullWidth={false}
        />

        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder={t("to_date")}
          className="w-36"
          fullWidth={false}
        />

        {(statusFilter || customerFilter || dateFrom || dateTo || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setCustomerFilter("");
              setDateFrom("");
              setDateTo("");
              setSearchTerm("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredQuotations}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <QuotationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuotation(null);
        }}
        onSave={handleSave}
        quotationToEdit={editingQuotation}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_quotation")}
        message={t("are_you_sure_delete_quotation")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_quotations")}
        message={t("are_you_sure_delete_quotations", { count: selectedIds.length })}
      />
    </div>
  );
};