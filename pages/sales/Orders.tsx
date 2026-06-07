import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  MoreHorizontal,
  Calendar,
  Filter,
  X,
  Package,
  User,
  Building2,
  DollarSign,
  CreditCard,
  Truck,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  ExportDropdown,
  Input,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { OrderModal } from "../../components/sales/OrderModal";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import salesService from "../../services/sales.service";
import { SalesOrder } from "../../types";
import { toast } from "sonner";

export const Orders: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    salesOrders,
    addSalesOrder,
    updateSalesOrder,
    deleteSalesOrder,
    currentUserEmployee,
    customers,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SalesOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<SalesOrder[]>(salesOrders);

  const isAdmin = user?.role === "admin";

  const fetchOrders = useCallback(async () => {
  try {
    setIsLoading(true);
    const data = await salesService.getAllSalesOrders();
    setOrders(data);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    toast.error(error.message || t("failed_to_fetch_orders"));
  } finally {
    setIsLoading(false);
  }
}, [t]);

const handleSave = async (order: Partial<SalesOrder>) => {
  try {
    setIsLoading(true);
    let response;
    if (editingOrder) {
      const orderId = editingOrder._id || editingOrder.id;
      response = await updateSalesOrder(orderId, {...order, id: orderId } as SalesOrder);
      toast.success(t("order_updated_successfully"));
      await fetchOrders(); // إعادة جلب البيانات بعد التحديث
    } else {
      response = await addSalesOrder(order as SalesOrder);
      toast.success(t("order_created_successfully"));
      await fetchOrders(); // إعادة جلب البيانات بعد الإنشاء
    }
    setIsModalOpen(false);
    setEditingOrder(null);
    // إعادة جلب البيانات بعد الحفظ مباشرة
    await fetchOrders();
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || t("failed_to_save_order");
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  const handleView = useCallback(
    (id: string) => {
      navigate(`/sales/orders/${id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback((order: SalesOrder) => {
    const orderWithIds = {
      ...order,
      id: order._id || order.id,
      customerId:
        typeof order.customerId === "object"
          ? (order.customerId as any)._id
          : order.customerId,
      salespersonId:
        typeof order.salespersonId === "object"
          ? (order.salespersonId as any)._id
          : order.salespersonId,
      items: order.items?.map((item) => ({
        ...item,
        productId:
          typeof item.productId === "object"
            ? (item.productId as any)._id
            : item.productId,
      })),
    };
    setEditingOrder(orderWithIds);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteSalesOrder(deleteId);
        toast.success(t("order_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds((prev) => prev.filter((sid) => sid !== deleteId));
        await fetchOrders(); // Refresh data after deletion to ensure UI is in sync
      } catch (error: any) {
        toast.error(error.message || t("failed_to_delete_order"));
      }
    }
  }, [deleteId, deleteSalesOrder, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map((id) => deleteSalesOrder(id)));
      toast.success(
        t("orders_deleted_successfully", { count: selectedIds.length }),
      );
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error: any) {
      console.error("Bulk delete failed", error);
      toast.error(error.message || t("failed_to_delete_orders"));
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records based on role
  const accessibleOrders = useMemo(() => {
    if (isAdmin || user?.role === "manager") return salesOrders;
    const currentId = currentUserEmployee?._id || currentUserEmployee?.id;
    return salesOrders.filter((o) => {
      const salespersonId =
        typeof o.salespersonId === "object"
          ? (o.salespersonId as any)._id
          : o.salespersonId;
      return salespersonId === currentId;
    });
  }, [isAdmin, user, salesOrders, currentUserEmployee]);

  // Apply filters
  const filteredOrders = useMemo(() => {
    return accessibleOrders.filter((o) => {
      const customerName =
        typeof o.customerId === "object"
          ? (o.customerId as any).customerName
          : "";
      const orderNo = o.orderNo || "";
      const matchesSearch =
        orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || o.status === statusFilter;
      const matchesPayment =
        !paymentFilter || o.paymentStatus === paymentFilter;
      const matchesCustomer =
        !customerFilter ||
        (typeof o.customerId === "object"
          ? (o.customerId as any)._id === customerFilter
          : o.customerId === customerFilter);

      const orderDate = new Date(o.orderDate);
      const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || orderDate <= new Date(dateTo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesCustomer &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    accessibleOrders,
    searchTerm,
    statusFilter,
    paymentFilter,
    customerFilter,
    dateFrom,
    dateTo,
  ]);

  // Statistics
  const totalOrders = filteredOrders.length;
  const totalValue = filteredOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0,
  );
  const pendingOrders = filteredOrders.filter(
    (o) => o.status === "DRAFT",
  ).length;
  const confirmedOrders = filteredOrders.filter(
    (o) => o.status === "CONFIRMED",
  ).length;
  const paidOrders = filteredOrders.filter(
    (o) => o.paymentStatus === "PAID",
  ).length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "warning" | "danger" | "info"; label: string }
    > = {
      CONFIRMED: { variant: "success", label: t("confirmed") },
      DRAFT: { variant: "warning", label: t("draft") },
      CANCELLED: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "warning" | "danger" | "info"; label: string }
    > = {
      PAID: { variant: "success", label: t("paid") },
      UNPAID: { variant: "danger", label: t("unpaid") },
      PARTIALLY_PAID: { variant: "warning", label: t("partially_paid") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDeliveryBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "warning" | "info" | "danger"; label: string }
    > = {
      DELIVERED: { variant: "success", label: t("delivered") },
      SHIPPED: { variant: "info", label: t("shipped") },
      PENDING: { variant: "warning", label: t("pending") },
      CANCELLED: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const customerOptions = [
    { value: "", label: t("all_customers") },
    ...customers.map((c) => ({ value: c._id || c.id, label: c.customerName })),
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "DRAFT", label: t("draft") },
    { value: "CONFIRMED", label: t("confirmed") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const paymentOptions = [
    { value: "", label: t("all_payment_statuses") },
    { value: "PAID", label: t("paid") },
    { value: "UNPAID", label: t("unpaid") },
    { value: "PARTIALLY_PAID", label: t("partially_paid") },
  ];

  const columns: Column<SalesOrder>[] = useMemo(
    () => [
      {
        header: t("order_no"),
        accessorKey: "orderNo",
        render: (o) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{o.orderNo}</span>
            <span className="text-xs text-gray-500">
              {formatDate(o.orderDate)}
            </span>
          </div>
        ),
      },
      {
        header: t("customer"),
        render: (o) => {
          const customer =
            typeof o.customerId === "object" ? o.customerId : null;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {customer?.customerName || "N/A"}
              </span>
              <span className="text-xs text-gray-500">
                {customer?.phoneNumber || ""}
              </span>
            </div>
          );
        },
      },
      {
        header: t("items"),
        render: (o) => (
          <div className="flex flex-col gap-0.5">
            {o.items?.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Package size={12} className="text-gray-400" />
                <span className="text-gray-600">
                  {typeof item.productId === "object"
                    ? (item.productId as any).productName
                    : item.sku}
                </span>
                <span className="text-gray-400">x{item.quantity}</span>
              </div>
            ))}
            {o.items && o.items.length > 2 && (
              <span className="text-xs text-gray-400">
                +{o.items.length - 2} more
              </span>
            )}
          </div>
        ),
      },
      {
        header: t("total"),
        render: (o) => (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-600">
              {o.totalAmount?.toLocaleString()} EGP
            </span>
            <span className="text-xs text-gray-400">
              {t("tax")}: {o.taxAmount?.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        header: t("status"),
        render: (o) => getStatusBadge(o.status),
      },
      {
        header: t("payment"),
        render: (o) => getPaymentBadge(o.paymentStatus),
      },
      {
        header: t("delivery"),
        render: (o) => getDeliveryBadge(o.deliveryStatus),
      },
      {
        header: t("salesperson"),
        render: (o) => {
          const salesperson =
            typeof o.salespersonId === "object" ? o.salespersonId : null;
          return (
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                {salesperson?.username || salesperson?.fullName || "N/A"}
              </span>
            </div>
          );
        },
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (o) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleView(o._id || o.id)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("view_details")}
            >
              <Eye size={16} />
            </button>
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
          <h1 className="text-2xl font-bold text-gray-900">{t("orders")}</h1>
          <p className="text-gray-500 mt-1">{t("manage_your_orders")}</p>
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
          <ExportDropdown data={filteredOrders} filename="orders" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingOrder(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_order")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_orders")}</p>
          <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("total_value")}</p>
          <p className="text-xl font-bold text-indigo-600">
            {totalValue.toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("pending_orders")}</p>
          <p className="text-xl font-bold text-orange-600">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("confirmed_orders")}</p>
          <p className="text-xl font-bold text-green-600">{confirmedOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t("paid_orders")}</p>
          <p className="text-xl font-bold text-blue-600">{paidOrders}</p>
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
            placeholder={t("search_orders")}
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
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {paymentOptions.map((option) => (
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

        {(statusFilter || paymentFilter || customerFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setPaymentFilter("");
              setCustomerFilter("");
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
      <OrderModal
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
        title={t("delete_order")}
        message={t("are_you_sure_delete_order")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_orders")}
        message={t("are_you_sure_delete_orders", { count: selectedIds.length })}
      />
    </div>
  );
};
