import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, MapPin, User, Phone, Building2, Filter, X, Warehouse as WarehouseIcon, Hash } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { WarehouseModal } from "../../components/inventory/WarehouseModal";
import { useData } from "../../context/DataContext";
import { Warehouse } from "../../types";
import { toast } from "sonner";

export const Warehouses: React.FC = () => {
  const { t } = useTranslation();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (warehouse: Partial<Warehouse>) => {
    try {
      setIsLoading(true);
      if (editingWarehouse) {
        await updateWarehouse({ ...warehouse, _id: editingWarehouse._id, id: editingWarehouse.id } as Warehouse);
        toast.success(t("warehouse_updated_successfully"));
      } else {
        await addWarehouse(warehouse as Warehouse);
        toast.success(t("warehouse_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toast.error(t("failed_to_save_warehouse"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteWarehouse(deleteId);
        toast.success(t("warehouse_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_warehouse"));
      }
    }
  }, [deleteId, deleteWarehouse, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteWarehouse(id)));
      toast.success(t("warehouses_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_warehouses"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getCompanyName = (warehouse: Warehouse): string => {
    if (!warehouse.companyId) return "-";
    if (typeof warehouse.companyId === 'object') {
      return (warehouse.companyId as any)?.name || "-";
    }
    return warehouse.companyId || "-";
  };

  const getBranchName = (warehouse: Warehouse): string => {
    if (!warehouse.branchId) return "-";
    if (typeof warehouse.branchId === 'object') {
      return (warehouse.branchId as any)?.name || "-";
    }
    return warehouse.branchId || "-";
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, { variant: "info" | "success" | "warning" | "purple" | "blue"; label: string }> = {
      MAIN_WAREHOUSE: { variant: "blue", label: t("main_warehouse") },
      SUB_WAREHOUSE: { variant: "info", label: t("sub_warehouse") },
      STORE: { variant: "success", label: t("store") },
      DISTRIBUTION_CENTER: { variant: "purple", label: t("distribution_center") },
      COLD_STORAGE: { variant: "info", label: t("cold_storage") },
      RAW_MATERIALS: { variant: "warning", label: t("raw_materials") },
      FINISHED_GOODS: { variant: "success", label: t("finished_goods") },
    };
    const config = typeMap[type] || { variant: "info", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "ACTIVE" ? "success" : "danger"}>
        {status === "ACTIVE" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Apply filters
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(w => {
      const matchesSearch = 
        w.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.managerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || w.type === typeFilter;
      const matchesStatus = !statusFilter || w.state === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [warehouses, searchTerm, typeFilter, statusFilter]);

  // Statistics
  const totalWarehouses = filteredWarehouses.length;
  const activeWarehouses = filteredWarehouses.filter(w => w.state === "ACTIVE").length;
  const mainWarehouses = filteredWarehouses.filter(w => w.type === "MAIN_WAREHOUSE").length;
  const distributionCenters = filteredWarehouses.filter(w => w.type === "DISTRIBUTION_CENTER").length;

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "MAIN_WAREHOUSE", label: t("main_warehouse") },
    { value: "SUB_WAREHOUSE", label: t("sub_warehouse") },
    { value: "STORE", label: t("store") },
    { value: "DISTRIBUTION_CENTER", label: t("distribution_center") },
    { value: "COLD_STORAGE", label: t("cold_storage") },
    { value: "RAW_MATERIALS", label: t("raw_materials") },
    { value: "FINISHED_GOODS", label: t("finished_goods") },
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const columns: Column<Warehouse>[] = useMemo(
    () => [
      {
        header: t("warehouse_info"),
        render: (w) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{w.warehouseName}</span>
              <span className="text-xs text-gray-500">{w.code}</span>
            </div>
          </div>
        )
      },
      {
        header: t("type"),
        render: (w) => getTypeLabel(w.type)
      },
      {
        header: t("location_contact"),
        render: (w) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{w.location || "-"}</span>
            </div>
            {w.managerName && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-gray-400" />
                <span className="text-sm text-gray-600">{w.managerName}</span>
              </div>
            )}
            {w.phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-gray-400" />
                <span className="text-sm text-gray-500">{w.phoneNumber}</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("company_branch"),
        render: (w) => (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">{getCompanyName(w)}</span>
            <span className="text-xs text-gray-500">{getBranchName(w)}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (w) => getStatusBadge(w.state)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (w) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(w)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(w._id || w.id)}
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
            {t("warehouses")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_storage_locations")}
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
          <ExportDropdown data={filteredWarehouses} filename="warehouses" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingWarehouse(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_warehouse")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_warehouses")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalWarehouses}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <WarehouseIcon size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeWarehouses}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("main_warehouse")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{mainWarehouses}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("distribution_center")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{distributionCenters}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_warehouses")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

        {(typeFilter || statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter("");
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
      <Card className="bg-white">
        <Table
          data={filteredWarehouses}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </Card>

      {/* Modal */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWarehouse(null);
        }}
        onSave={handleSave}
        warehouseToEdit={editingWarehouse}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_warehouse")}
        message={t("are_you_sure_delete_warehouse")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_warehouses")}
        message={t("are_you_sure_delete_warehouses", { count: selectedIds.length })}
      />
    </div>
  );
};