import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Eye, Filter, X, Calendar, DollarSign, RefreshCw, FileText, Package } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { SalesReturnModal } from "../../components/sales/SalesReturnModal";
import { useData } from "../../context/DataContext";
import { SalesReturn } from "../../types";
import { toast } from "sonner";

export const SalesReturnPage: React.FC = () => {
  const { t } = useTranslation();
  const { salesReturns, addSalesReturn, updateSalesReturn, deleteSalesReturn, fetchSalesReturnsData } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReturn, setEditingReturn] = useState<SalesReturn | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (returnData: Partial<SalesReturn>) => {
    try {
      setIsLoading(true);
      let response;
      if (editingReturn) {
        const salesReturnId = editingReturn._id || editingReturn.id;
        response = await updateSalesReturn({ ...returnData, _id: salesReturnId, id: salesReturnId } as SalesReturn);
        toast.success(t("sales_return_updated_successfully"));
        await fetchSalesReturnsData();
      } else {
        response = await addSalesReturn(returnData as SalesReturn);
        toast.success(t("sales_return_created_successfully"));
        await fetchSalesReturnsData();
      }
      setIsModalOpen(false);
      setEditingReturn(null);
    } catch (error: any) {
      console.error("Error saving sales return:", error);
      const message = error?.message || t("failed_to_save_sales_return");
      toast.error(message);
      await fetchSalesReturnsData(); // Refresh data to ensure UI consistency after error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((returnData: SalesReturn) => {
    const salesReturnWithId = {
      ...returnData,
      id: returnData._id || returnData.id, // Ensure we have an 'id' field for the modal
    };
    setEditingReturn(salesReturnWithId);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteSalesReturn(deleteId);
        toast.success(t("sales_return_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchSalesReturnsData();
      } catch (error) {
        toast.error(t("failed_to_delete_sales_return"));
      }
    }
  }, [deleteId, deleteSalesReturn, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteSalesReturn(id)));
      toast.success(t("sales_returns_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_sales_returns"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getCustomerName = (returnData: SalesReturn): string => {
    if (typeof returnData.customerId === "object" && returnData.customerId !== null) {
      return (returnData.customerId as any)?.customerName || (returnData.customerId as any)?.name || "-";
    }
    return "-";
  };

  const getInvoiceNumber = (returnData: SalesReturn): string => {
    if (typeof returnData.originalInvoiceId === "object" && returnData.originalInvoiceId !== null) {
      return (returnData.originalInvoiceId as any)?.invoiceNumber || "-";
    }
    return returnData.originalInvoiceId || "-";
  };

  const getProductNames = (returnData: SalesReturn): string => {
    if (returnData.items && returnData.items.length > 0) {
      return returnData.items.map(item => {
        if (typeof item.productId === "object" && item.productId !== null) {
          return (item.productId as any)?.productName;
        }
        return item.sku || "Product";
      }).join(", ");
    }
    return "-";
  };

  const getTotalReturnQuantity = (returnData: SalesReturn): number => {
    if (returnData.items && returnData.items.length > 0) {
      return returnData.items.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);
    }
    return 0;
  };

  // Apply filters
  const filteredReturns = useMemo(() => {
    return salesReturns.filter(r => {
      const customerName = getCustomerName(r).toLowerCase();
      const returnNumber = r.returnNumber?.toLowerCase() || "";
      const invoiceNumber = getInvoiceNumber(r).toLowerCase();
      
      const matchesSearch = 
        returnNumber.includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase()) ||
        invoiceNumber.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || r.refundStatus === statusFilter;
      
      const returnDate = new Date(r.returnDate);
      const matchesDateFrom = !dateFrom || returnDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || returnDate <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [salesReturns, searchTerm, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalReturns = filteredReturns.length;
  const pendingReturns = filteredReturns.filter(r => r.refundStatus === "PENDING").length;
  const refundedReturns = filteredReturns.filter(r => r.refundStatus === "REFUNDED").length;
  const rejectedReturns = filteredReturns.filter(r => r.refundStatus === "REJECTED").length;
  const totalQuantity = filteredReturns.reduce((sum, r) => sum + getTotalReturnQuantity(r), 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger"; label: string }> = {
      PENDING: { variant: "warning", label: t("pending") },
      REFUNDED: { variant: "success", label: t("refunded") },
      REJECTED: { variant: "danger", label: t("rejected") },
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
    { value: "PENDING", label: t("pending") },
    { value: "REFUNDED", label: t("refunded") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const columns: Column<SalesReturn>[] = useMemo(
    () => [
      {
        header: t("return_info"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <RefreshCw size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{r.returnNumber}</span>
              <span className="text-xs text-gray-500">{t("invoice")}: {getInvoiceNumber(r)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("customer"),
        render: (r) => (
          <span className="text-sm text-gray-600">{getCustomerName(r)}</span>
        )
      },
      {
        header: t("product"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600 line-clamp-1">{getProductNames(r)}</span>
          </div>
        )
      },
      {
        header: t("quantity"),
        render: (r) => (
          <span className="text-sm font-medium">{getTotalReturnQuantity(r)}</span>
        )
      },
      {
        header: t("return_date"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{formatDate(r.returnDate)}</span>
          </div>
        )
      },
      {
        header: t("refund_status"),
        render: (r) => getStatusBadge(r.refundStatus)
      },
      {
        header: t("reason"),
        render: (r) => (
          <span className="text-sm text-gray-500 line-clamp-1">{r.items?.[0]?.reasonForReturn || "-"}</span>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(r)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(r._id || r.id)}
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
            {t("sales_return")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_sales_returns")}
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
          <ExportDropdown data={filteredReturns} filename="sales-returns" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingReturn(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_sales_return")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_returns")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_quantity")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalQuantity}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("refunded")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{refundedReturns}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedReturns}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_returns")}
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
          data={filteredReturns}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <SalesReturnModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReturn(null);
        }}
        onSave={handleSave}
        returnToEdit={editingReturn}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_sales_return")}
        message={t("are_you_sure_delete_sales_return")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_sales_returns")}
        message={t("are_you_sure_delete_sales_returns", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock, XCircle } from "lucide-react";