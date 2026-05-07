import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Wrench, DollarSign, Gauge, Building2, Calendar } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { MaintenanceFormModal } from "../../components/fleet/MaintenanceFormModal";
import { fleetService } from "../../services/fleet.service";
import { MaintenanceRecord, Vehicle } from "../../types";
import { toast } from "sonner";

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, vehiclesData] = await Promise.all([
        fleetService.getMaintenance(),
        fleetService.getVehicles(),
      ]);
      setMaintenanceRecords(maintenanceData);
      setVehicles(vehiclesData);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || t("failed_to_fetch_maintenance"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<MaintenanceRecord>) => {
    try {
      if (selectedRecord) {
        await fleetService.updateMaintenance(selectedRecord._id, data);
        toast.success(t("maintenance_updated_successfully"));
      } else {
        await fleetService.createMaintenance(data);
        toast.success(t("maintenance_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to save maintenance record:", error);
      toast.error(error.message || t("failed_to_save_maintenance"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!recordIdToDelete) return;
    try {
      await fleetService.deleteMaintenance(recordIdToDelete);
      setIsDeleteModalOpen(false);
      setRecordIdToDelete(null);
      toast.success(t("maintenance_deleted_successfully"));
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete maintenance record:", error);
      toast.error(error.message || t("failed_to_delete_maintenance"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "info" | "warning" | "danger" | "neutral"; label: string }> = {
      Completed: { variant: "success", label: t("completed") },
      Pending: { variant: "info", label: t("pending") },
      Scheduled: { variant: "warning", label: t("scheduled") },
      Canceled: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredRecords = maintenanceRecords.filter((r) => {
    const matchesSearch =
      r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<MaintenanceRecord>[] = [
    {
      header: t("date"),
      accessorKey: "date",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Calendar size={14} className="text-orange-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {new Date(item.date).toLocaleDateString()}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("vehicle"),
      render: (item) => {
        const vehicle = typeof item.vehicleId === "object" ? item.vehicleId : null;
        return vehicle ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{vehicle.plateNumber}</span>
            <span className="text-xs text-gray-500">{vehicle.model}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("unknown")}</span>
        );
      },
    },
    {
      header: t("maintenance_type"),
      accessorKey: "type",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Wrench size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{item.type}</span>
        </div>
      ),
    },
    {
      header: t("cost"),
      accessorKey: "cost",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{item.cost.toLocaleString()} EGP</span>
        </div>
      ),
    },
    {
      header: t("odometer"),
      accessorKey: "odometer",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Gauge size={14} className="text-gray-400" />
          <span className="text-sm">{item.odometer.toLocaleString()} km</span>
        </div>
      ),
    },
    {
      header: t("provider"),
      accessorKey: "provider",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Building2 size={14} className="text-gray-400" />
          <span className="text-sm">{item.provider}</span>
        </div>
      ),
    },
    {
      header: t("status"),
      accessorKey: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedRecord(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setRecordIdToDelete(item._id);
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
    { value: "Scheduled", label: t("scheduled") },
    { value: "Pending", label: t("pending") },
    { value: "Completed", label: t("completed") },
    { value: "Canceled", label: t("cancelled") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("maintenance")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_vehicle_maintenance")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={maintenanceRecords} filename="maintenance" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_maintenance_record")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_maintenance_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <Table
        columns={columns}
        data={filteredRecords}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        selectedRecord={selectedRecord}
        vehicles={vehicles}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_maintenance_record")}
        message={t("are_you_sure_delete_maintenance")}
      />
    </div>
  );
};