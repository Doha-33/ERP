import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Package, Building2, DollarSign, Filter, X, FileText, Truck, CreditCard, Eye } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PurchaseOrderModal } from "../../components/purchase/PurchaseOrderModal";
import { useData } from "../../context/DataContext";
import { PurchaseOrder } from "../../types";
import { toast } from "sonner";

export const PurchaseOrders: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (order: Partial<PurchaseOrder>) => {
    try {
      setIsLoading(true);
      if (editingOrder) {
        await updatePurchaseOrder({ ...order, _id: editingOrder._id, id: editingOrder.id } as PurchaseOrder);
        toast.success(t("purchase_order_updated_successfully"));
      } else {
        await addPurchaseOrder(order as PurchaseOrder);
        toast.success(t("purchase_order_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("Error saving purchase order:", error);
      toast.error(t("failed_to_save_purchase_order"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePurchaseOrder(deleteId);
        toast.success(t("purchase_order_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_purchase_order"));
      }
    }
  }, [deleteId, deletePurchaseOrder, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePurchaseOrder(id)));
      toast.success(t("purchase_orders_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_purchase_orders"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getSupplierName = (order: PurchaseOrder): string => {
    if (!order.supplierId) return "-";
    if (typeof order.supplierId === 'object') {
      return (order.supplierId as any)?.supplierName || "-";
    }
    return order.supplierId || "-";
  };

  const getCompanyName = (order: PurchaseOrder): string => {
    if (!order.companyId) return "-";
    if (typeof order.companyId === 'object') {
      return (order.companyId as any)?.name || "-";
    }
    return order.companyId || "-";
  };

  const getBranchName = (order: PurchaseOrder): string => {
    if (!order.branchId) return "-";
    if (typeof order.branchId === 'object') {
      return (order.branchId as any)?.name || "-";
    }
    return order.branchId || "-";
  };

  // Apply filters
  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(o => {
      const supplierName = getSupplierName(o).toLowerCase();
      const matchesSearch = 
        o.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplierName.includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || o.paymentStatus === statusFilter || o.deliveryStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchTerm, statusFilter]);

  // Statistics
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = filteredOrders.filter(o => o.deliveryStatus === "PENDING").length;
  const deliveredOrders = filteredOrders.filter(o => o.deliveryStatus === "DELIVERED").length;
  const paidOrders = filteredOrders.filter(o => o.paymentStatus === "PAID").length;

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

  const columns: Column<PurchaseOrder>[] = useMemo(
    () => [
      {
        header: t("order_info"),
        render: (o) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{o.referenceNo}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">
              {new Date(o.orderDate).toLocaleDateString()}
            </span>
          </div>
        )
      },
      {
        header: t("supplier"),
        render: (o) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Building2 size={14} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{getSupplierName(o)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{getCompanyName(o)} / {getBranchName(o)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("items"),
        render: (o) => (
          <div className="flex flex-col gap-0.5">
            {o.items?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Package size={12} className="text-gray-400" />
                <span className="text-gray-600">{item.sku || "Item"}</span>
                <span className="text-gray-400">x{item.quantity}</span>
              </div>
            ))}
            {o.items && o.items.length > 2 && (
              <span className="text-xs text-gray-400">+{o.items.length - 2} more</span>
            )}
          </div>
        )
      },
      {
        header: t("total"),
        render: (o) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{o.totalAmount?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("payment"),
        render: (o) => getPaymentBadge(o.paymentStatus)
      },
      {
        header: t("delivery"),
        render: (o) => getDeliveryBadge(o.deliveryStatus)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (o) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(o)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(o._id || o.id)}
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
            {t("purchase_order")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_purchase_order")}
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
          <ExportDropdown data={filteredOrders} filename="purchase-orders" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingOrder(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_purchase_order")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_orders")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalOrders}</p>
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
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending_delivery")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Truck size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("delivered")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{deliveredOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("paid")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{paidOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_purchase_orders")}
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
          data={filteredOrders}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <PurchaseOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOrder(null);
        }}
        onSave={handleSave}
        orderToEdit={editingOrder}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_purchase_order")}
        message={t("are_you_sure_delete_purchase_order")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_purchase_orders")}
        message={t("are_you_sure_delete_purchase_orders", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { Clock } from "lucide-react";