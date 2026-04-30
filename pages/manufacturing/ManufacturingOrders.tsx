import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Plus, Search, Edit2, Trash2, Package, 
  Hash, Calendar, User, Layers, ClipboardList,
  CheckCircle, Clock, AlertCircle, XCircle
} from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { MOFormModal } from "../../components/manufacturing/MOFormModal";
import {manufacturingService} from "../../services/manufacturing.service";
import { ManufacturingOrder as MOType } from "../../types";
import { toast } from "sonner";

export const ManufacturingOrders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<MOType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MOType | null>(null);
  const [orderIdToDelete, setOrderIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getManufacturingOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch manufacturing orders:", error);
      toast.error(t("failed_to_fetch_mos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSave = async (data: Partial<MOType>) => {
    try {
      if (selectedOrder) {
        await manufacturingService.updateManufacturingOrder(selectedOrder._id, data);
        toast.success(t("mo_updated_successfully"));
      } else {
        await manufacturingService.createManufacturingOrder(data);
        toast.success(t("mo_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchOrders();
    } catch (error) {
      console.error("Failed to save manufacturing order:", error);
      toast.error(t("failed_to_save_mo"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!orderIdToDelete) return;
    try {
      await manufacturingService.deleteManufacturingOrder(orderIdToDelete);
      setIsDeleteModalOpen(false);
      setOrderIdToDelete(null);
      toast.success(t("mo_deleted_successfully"));
      await fetchOrders();
    } catch (error) {
      console.error("Failed to delete manufacturing order:", error);
      toast.error(t("failed_to_delete_mo"));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string; icon: any }> = {
      Draft: { variant: "neutral", label: t("draft"), icon: ClipboardList },
      Confirmed: { variant: "info", label: t("confirmed"), icon: CheckCircle },
      "In Progress": { variant: "warning", label: t("in_progress"), icon: Clock },
      Completed: { variant: "success", label: t("completed"), icon: CheckCircle },
      Cancelled: { variant: "danger", label: t("cancelled"), icon: XCircle },
    };
    const config = statusMap[status] || { variant: "neutral", label: status, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  // Calculate production progress percentage
  const getProgress = (planned: number, produced: number) => {
    if (!planned || planned === 0) return 0;
    return Math.round((produced / planned) * 100);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.mo_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.responsible?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<MOType>[] = [
    {
      header: t("mo_number"),
      accessorKey: "mo_number",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Hash size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.mo_number}</span>
            <span className="text-xs text-gray-500">{item.bom_used}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("product_info"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
          </div>
          <span className="text-xs text-gray-500 ml-5">{item.product_code}</span>
        </div>
      ),
    },
    {
      header: t("quantity"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-gray-400" />
            <span className="text-sm">
              {item.produced_quantity || 0} / {item.planned_quantity}
            </span>
          </div>
          <div className="w-24 mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${getProgress(item.planned_quantity, item.produced_quantity || 0)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: t("dates"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs">Start: {new Date(item.start_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs">End: {new Date(item.end_date).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("responsible"),
      accessorKey: "responsible",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-gray-400" />
          <span className="text-sm">{item.responsible}</span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessorKey: "state",
      render: (item) => getStatusBadge(item.state),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedOrder(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setOrderIdToDelete(item._id);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "all", label: t("all_statuses") },
    { value: "Draft", label: t("draft") },
    { value: "Confirmed", label: t("confirmed") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("manufacturing_orders")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_mo")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={orders} filename="manufacturing-orders" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedOrder(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("create_mo")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_mo_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
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
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      {/* Add/Edit Modal */}
      <MOFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        selectedOrder={selectedOrder}
        onSave={handleSave}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_mo")}
        message={t("are_you_sure_delete_mo")}
      />
    </div>
  );
};