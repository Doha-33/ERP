import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  X,
  Calendar,
  DollarSign,
  CreditCard,
  Warehouse,
  FileText,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  ExportDropdown,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { InvoiceModal } from "../../components/sales/InvoiceModal";
import { useData } from "../../context/DataContext";
import { SalesInvoice } from "../../types";
import { toast } from "sonner";

export const Invoices: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    salesInvoices,
    addSalesInvoice,
    updateSalesInvoice,
    deleteSalesInvoice,
      fetchSalesInvoicesData,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SalesInvoice | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (invoice: Partial<SalesInvoice>) => {
    try {
      setIsLoading(true);
      let respone;
      if (editingInvoice) {
        const invoiceId = editingInvoice._id || editingInvoice.id;
        respone = await updateSalesInvoice({
          ...invoice,
          id: invoiceId,
        } as SalesInvoice);
        toast.success(t("invoice_updated_successfully"));
        await fetchSalesInvoicesData(); // Refresh data after update to ensure UI is in sync
      } else {
        respone = await addSalesInvoice(invoice as SalesInvoice);
        toast.success(t("invoice_created_successfully"));
        await fetchSalesInvoicesData(); // Refresh data after creation to ensure UI is in sync
      }
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error: any) {
      const message =
        error?.message ||
        (editingInvoice
          ? t("failed_to_update_invoice")
          : t("failed_to_create_invoice"));
      toast.error(message);
      await fetchSalesInvoicesData(); // Refresh data even if the operation failed
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((invoice: SalesInvoice) => {
    const invoiceToEdit = {
      ...invoice,
      id: invoice._id || invoice.id,
      customerId:
        typeof invoice.customerId === "object" && invoice.customerId !== null
          ? (invoice.customerId as any)._id || (invoice.customerId as any).id
          : invoice.customerId,
      warehouseId:
        typeof invoice.warehouseId === "object" && invoice.warehouseId !== null
          ? (invoice.warehouseId as any)._id || (invoice.warehouseId as any).id
          : invoice.warehouseId,
      salesOrderId:
        typeof invoice.salesOrderId === "object" && invoice.salesOrderId !== null
          ? (invoice.salesOrderId as any)._id || (invoice.salesOrderId as any).id
          : invoice.salesOrderId,
    };
    setEditingInvoice(invoiceToEdit);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteSalesInvoice(deleteId);
        toast.success(t("invoice_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
        await fetchSalesInvoicesData(); // Refresh data after deletion to ensure UI is in sync
      } catch (error: any) {
        toast.error(error.message || t("failed_to_delete_invoice"));
      }
    }
  }, [deleteId, deleteSalesInvoice, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteSalesInvoice(id)));
      toast.success(
        t("invoices_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error: any) {
      console.error("Bulk delete failed", error);
      toast.error(error.message || t("failed_to_delete_invoices"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getCustomerName = (invoice: SalesInvoice): string => {
    if (typeof invoice.customerId === "object" && invoice.customerId !== null) {
      return (
        (invoice.customerId as any)?.customerName ||
        (invoice.customerId as any)?.name ||
        "-"
      );
    }
    return "-";
  };

  const getWarehouseName = (invoice: SalesInvoice): string => {
    if (
      typeof invoice.warehouseId === "object" &&
      invoice.warehouseId !== null
    ) {
      return (invoice.warehouseId as any)?.warehouseName || "-";
    }
    return invoice.warehouseId || "-";
  };

  const getOrderNo = (invoice: SalesInvoice): string => {
    if (
      typeof invoice.salesOrderId === "object" &&
      invoice.salesOrderId !== null
    ) {
      return (invoice.salesOrderId as any)?.orderNo || "-";
    }
    return invoice.salesOrderId || "-";
  };

  // Apply filters
  const filteredInvoices = useMemo(() => {
    return salesInvoices.filter((i) => {
      const customerName = getCustomerName(i).toLowerCase();
      const invoiceNo = i.invoiceNumber?.toLowerCase() || "";
      const orderNo = getOrderNo(i).toLowerCase();

      const matchesSearch =
        invoiceNo.includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase()) ||
        orderNo.includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || i.paymentStatus === statusFilter;

      const invoiceDate = new Date(i.issuedDate);
      const matchesDateFrom = !dateFrom || invoiceDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || invoiceDate <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [salesInvoices, searchTerm, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce(
    (sum, i) => sum + (i.totalAmount || 0),
    0,
  );
  const paidInvoices = filteredInvoices.filter(
    (i) => i.paymentStatus === "PAID",
  ).length;
  const unpaidInvoices = filteredInvoices.filter(
    (i) => i.paymentStatus === "UNPAID",
  ).length;
  const partiallyPaid = filteredInvoices.filter(
    (i) => i.paymentStatus === "PARTIALLY_PAID",
  ).length;

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "danger" | "warning"; label: string }
    > = {
      PAID: { variant: "success", label: t("paid") },
      UNPAID: { variant: "danger", label: t("unpaid") },
      PARTIALLY_PAID: { variant: "warning", label: t("partially_paid") },
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
    { value: "PAID", label: t("paid") },
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIALLY_PAID", label: t("partially_paid") },
  ];

  const columns: Column<SalesInvoice>[] = useMemo(
    () => [
      {
        header: t("invoice_info"),
        render: (i) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <FileText size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {i.invoiceNumber}
              </span>
              <span className="text-xs text-gray-500">
                {t("order")}: {getOrderNo(i)}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: t("customer"),
        render: (i) => (
          <span className="text-sm text-gray-600">{getCustomerName(i)}</span>
        ),
      },
      {
        header: t("dates"),
        render: (i) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">
                {t("issued")}: {formatDate(i.issuedDate)}
              </span>
            </div>
            {i.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-600">
                  {t("due")}: {formatDate(i.dueDate)}
                </span>
              </div>
            )}
          </div>
        ),
      },
      {
        header: t("amount"),
        render: (i) => (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-600">
              {i.totalAmount?.toLocaleString()} EGP
            </span>
            <span className="text-xs text-gray-400">
              {t("tax")}: {i.taxAmount?.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        header: t("payment_status"),
        render: (i) => getPaymentBadge(i.paymentStatus),
      },
      {
        header: t("warehouse"),
        render: (i) => (
          <div className="flex items-center gap-1.5">
            <Warehouse size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{getWarehouseName(i)}</span>
          </div>
        ),
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
        ),
      },
    ],
    [t, handleEdit, handleDelete, navigate],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("invoices")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_invoices")}</p>
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
          <ExportDropdown data={filteredInvoices} filename="invoices" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingInvoice(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_invoice")}
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
          <p className="text-xl font-bold text-gray-900 mt-1">
            {totalInvoices}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">
            {totalAmount.toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("paid")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">
            {paidInvoices}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("unpaid")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">
            {unpaidInvoices}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("partially_paid")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">
            {partiallyPaid}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder={t("search_invoices")}
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

        {(statusFilter || dateFrom || dateTo || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
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
        data={filteredInvoices}
        columns={columns}
        keyExtractor={(item) => item._id || item.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSave}
        invoiceToEdit={editingInvoice}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_invoice")}
        message={t("are_you_sure_delete_invoice")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_invoices")}
        message={t("are_you_sure_delete_invoices", {
          count: selectedIds.length,
        })}
      />
    </div>
  );
};
