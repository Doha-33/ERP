import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Laptop, User, Hash, Calendar, Filter, X, ChevronDown, UserCheck } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { AssignLaptopModal } from "../../components/hr/AssignLaptopModal";
import { useData } from "../../context/DataContext";
import { AssignLaptop } from "../../types";
import { toast } from "sonner";

export const AssignLaptopPage: React.FC = () => {
  const { t } = useTranslation();
  const { assignLaptops, addAssignLaptop, updateAssignLaptop, deleteAssignLaptop, employees } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<AssignLaptop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (laptop: Partial<AssignLaptop>) => {
    try {
      setIsLoading(true);
      if (editingLaptop) {
        await updateAssignLaptop({ ...laptop, _id: editingLaptop._id, id: editingLaptop.id } as AssignLaptop);
        toast.success(t("assign_laptop_updated_successfully"));
      } else {
        await addAssignLaptop(laptop as AssignLaptop);
        toast.success(t("assign_laptop_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingLaptop(null);
    } catch (error) {
      console.error("Error saving assign laptop:", error);
      toast.error(t("failed_to_save_assign_laptop"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((laptop: AssignLaptop) => {
    setEditingLaptop(laptop);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteAssignLaptop(deleteId);
        toast.success(t("assign_laptop_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_assign_laptop"));
      }
    }
  }, [deleteId, deleteAssignLaptop, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteAssignLaptop(id)));
      toast.success(t("assign_laptops_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_assign_laptops"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getEmployeeName = (laptop: AssignLaptop): string => {
    if (typeof laptop.employeeInfo === "object" && laptop.employeeInfo !== null) {
      return (laptop.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === laptop.employeeInfo);
    return employee?.fullName || laptop.empName || "-";
  };

  const getEmployeeCode = (laptop: AssignLaptop): string => {
    if (typeof laptop.employeeInfo === "object" && laptop.employeeInfo !== null) {
      return (laptop.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => (e._id || e.id) === laptop.employeeInfo);
    return employee?.employeeCode || laptop.empCode || "-";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "info"; label: string }> = {
      Assigned: { variant: "success", label: t("assigned") },
      Pending: { variant: "warning", label: t("pending") },
      Returned: { variant: "info", label: t("returned") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Apply filters
  const filteredLaptops = useMemo(() => {
    return assignLaptops.filter(l => {
      const employeeName = getEmployeeName(l).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        l.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.deviceType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || l.status === statusFilter;
      const matchesDevice = !deviceFilter || l.deviceType === deviceFilter;
      
      return matchesSearch && matchesStatus && matchesDevice;
    });
  }, [assignLaptops, searchTerm, statusFilter, deviceFilter]);

  // Statistics
  const totalAssignments = filteredLaptops.length;
  const assignedCount = filteredLaptops.filter(l => l.status === "Assigned").length;
  const pendingCount = filteredLaptops.filter(l => l.status === "Pending").length;
  const returnedCount = filteredLaptops.filter(l => l.status === "Returned").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Assigned", label: t("assigned") },
    { value: "Pending", label: t("pending") },
    { value: "Returned", label: t("returned") },
  ];

  const deviceOptions = [
    { value: "", label: t("all_devices") },
    { value: "Laptop", label: t("laptop") },
    { value: "Monitor", label: t("monitor") },
    { value: "Phone", label: t("phone") },
    { value: "Tablet", label: t("tablet") },
    { value: "Mouse", label: t("mouse") },
    { value: "Keyboard", label: t("keyboard") },
  ];

  const columns: Column<AssignLaptop>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (l) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{getEmployeeName(l)}</span>
              <span className="text-xs text-gray-500">{getEmployeeCode(l)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("device_info"),
        render: (l) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Laptop size={14} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">{l.deviceType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Hash size={12} className="text-gray-400" />
              <span className="text-xs font-mono text-gray-500">{l.serialNumber}</span>
            </div>
          </div>
        )
      },
      {
        header: t("assignment"),
        render: (l) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-600">{formatDate(l.doneAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <UserCheck size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{l.doneBy || "-"}</span>
            </div>
          </div>
        )
      },
      {
        header: t("status"),
        render: (l) => getStatusBadge(l.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (l) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(l)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(l._id || l.id)}
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
            {t("assign_laptop")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_assign_laptop")}
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
          <ExportDropdown data={filteredLaptops} filename="assigned-devices" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingLaptop(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_assign_laptop")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Laptop size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_assignments")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalAssignments}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("assigned")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{assignedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-gray-500" />
            <p className="text-xs text-gray-500">{t("returned")}</p>
          </div>
          <p className="text-xl font-bold text-gray-600 mt-1">{returnedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_assign_laptop")}
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
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {deviceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(statusFilter || deviceFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setDeviceFilter("");
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
          data={filteredLaptops}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <AssignLaptopModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLaptop(null);
        }}
        onSave={handleSave}
        laptopToEdit={editingLaptop}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_assign_laptop")}
        message={t("are_you_sure_delete_assign_laptop")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_assign_laptops")}
        message={t("are_you_sure_delete_assign_laptops", { count: selectedIds.length })}
      />
    </div>
  );
};

// Add missing imports
import { CheckCircle, Clock, XCircle } from "lucide-react";