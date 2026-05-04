import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, FileText, Building2, DollarSign, Filter, X, Calendar, Truck, CreditCard, Eye, Warehouse } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PurchaseInvoiceModal } from "../../components/purchase/PurchaseInvoiceModal";
import { useData } from "../../context/DataContext";
import { PurchaseInvoice } from "../../types";
import { toast } from "sonner";

export const PurchaseInvoices: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseInvoices, addPurchaseInvoice, updatePurchaseInvoice, deletePurchaseInvoice } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (invoice: Partial<PurchaseInvoice>) => {
    try {
      setIsLoading(true);
      if (editingInvoice) {
        await updatePurchaseInvoice({ ...invoice, _id: editingInvoice._id, id: editingInvoice.id } as PurchaseInvoice );
        toast.success(t("purchase_invoice_updated_successfully"));
      } else {
        await addPurchaseInvoice(invoice as PurchaseInvoice);
        toast.success(t("purchase_invoice_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Error saving purchase invoice:", error);
      toast.error(t("failed_to_save_purchase_invoice"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((invoice: PurchaseInvoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePurchaseInvoice(deleteId);
        toast.success(t("purchase_invoice_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_purchase_invoice"));
      }
    }
  }, [deleteId, deletePurchaseInvoice, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePurchaseInvoice(id)));
      toast.success(t("purchase_invoices_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_purchase_invoices"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getSupplierName = (invoice: PurchaseInvoice): string => {
    if (!invoice.supplierId) return "-";
    if (typeof invoice.supplierId === 'object') {
      return (invoice.supplierId as any)?.supplierName || "-";
    }
    return invoice.supplierId || "-";
  };

  const getWarehouseName = (invoice: PurchaseInvoice): string => {
    if (!invoice.warehouseId) return "-";
    if (typeof invoice.warehouseId === 'object') {
      return (invoice.warehouseId as any)?.warehouseName || "-";
    }
    return invoice.warehouseId || "-";
  };

  const getCompanyName = (invoice: PurchaseInvoice): string => {
    if (!invoice.companyId) return "-";
    if (typeof invoice.companyId === 'object') {
      return (invoice.companyId as any)?.name || "-";
    }
    return invoice.companyId || "-";
  };

  // Apply filters
  const filteredInvoices = useMemo(() => {
    return purchaseInvoices.filter(i => {
      const supplierName = getSupplierName(i).toLowerCase();
      const matchesSearch = 
        i.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || i.paymentStatus === statusFilter || i.deliveryStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchaseInvoices, searchTerm, statusFilter]);

  // Statistics
  const totalInvoices = filteredInvoices.length;
  const totalValue = filteredInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const paidInvoices = filteredInvoices.filter(i => i.paymentStatus === "PAID").length;
  const unpaidInvoices = filteredInvoices.filter(i => i.paymentStatus === "UNPAID").length;
  const deliveredInvoices = filteredInvoices.filter(i => i.deliveryStatus === "DELIVERED").length;

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
      PAID: { variant: "success", label: t("paid") },
      PARTIAL: { variant: "warning", label: t("partial") },
      UNPAID: { variant: "danger", label: t("unpaid") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDeliveryBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "info" | "danger"; label: string }> = {
      DELIVERED: { variant: "success", label: t("delivered") },
      PROCESSING: { variant: "info", label: t("processing") },
      PENDING: { variant: "warning", label: t("pending") },
      CANCELLED: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PAID", label: t("paid") },
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIAL", label: t("partial") },
    { value: "PENDING", label: t("pending") },
    { value: "DELIVERED", label: t("delivered") },
  ];

  const columns: Column<PurchaseInvoice>[] = useMemo(
    () => [
      {
        header: t("invoice_info"),
        render: (i) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{i.invoiceNo}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">
              {new Date(i.invoiceDate).toLocaleDateString()}
            </span>
          </div>
        )
      },
      {
        header: t("supplier"),
        render: (i) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{getSupplierName(i)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Warehouse size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{getWarehouseName(i)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("due_date"),
        render: (i) => {
          const isOverdue = new Date(i.dueDate) < new Date() && i.paymentStatus !== "PAID";
          return (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              <span className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                {new Date(i.dueDate).toLocaleDateString()}
              </span>
            </div>
          );
        }
      },
      {
        header: t("total"),
        render: (i) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{i.totalAmount?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("payment"),
        render: (i) => getPaymentBadge(i.paymentStatus)
      },
      {
        header: t("delivery"),
        render: (i) => getDeliveryBadge(i.deliveryStatus)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (i) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(i)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(i._id || i.id)}
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
            {t("purchase_invoice")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_purchase_invoice")}
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
          <ExportDropdown data={filteredInvoices} filename="purchase-invoices" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_purchase_invoice")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_invoices")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalInvoices}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_value")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("paid")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{paidInvoices}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("unpaid")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{unpaidInvoices}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("delivered")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{deliveredInvoices}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_purchase_invoices")}
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

        {(statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
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
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <PurchaseInvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSave}
        invoiceToEdit={editingInvoice}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_purchase_invoice")}
        message={t("are_you_sure_delete_purchase_invoice")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_purchase_invoices")}
        message={t("are_you_sure_delete_purchase_invoices", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock } from "lucide-react";