import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Car, Fuel, Gauge } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { VehicleFormModal } from "../../components/fleet/VehicleModal";
import { fleetService } from "../../services/fleet.service";
import { Vehicle } from "../../types";
import { toast } from "sonner";

export const Vehicles: React.FC = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleIdToDelete, setVehicleIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getVehicles();
      setVehicles(data);
    } catch (error: any) {
      console.error("Failed to fetch vehicles:", error);
      toast.error(error.message || t("failed_to_fetch_vehicles"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSave = async (data: Partial<Vehicle>) => {
    try {
      if (selectedVehicle) {
        await fleetService.updateVehicle(selectedVehicle._id, data);
        toast.success(t("vehicle_updated_successfully"));
      } else {
        await fleetService.createVehicle(data);
        toast.success(t("vehicle_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchVehicles();
    } catch (error: any) {
      console.error("Failed to save vehicle:", error);
      toast.error(error.message || t("failed_to_save_vehicle"));
    }
  };

  const handleDelete = async () => {
    if (!vehicleIdToDelete) return;
    try {
      await fleetService.deleteVehicle(vehicleIdToDelete);
      setIsDeleteModalOpen(false);
      setVehicleIdToDelete(null);
      toast.success(t("vehicle_deleted_successfully"));
      await fetchVehicles();
    } catch (error: any) {
      console.error("Failed to delete vehicle:", error);
      toast.error(error.message || t("failed_to_delete_vehicle"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string }> = {
      Active: { variant: "success", label: t("active") },
      "In Maintenance": { variant: "warning", label: t("in_maintenance") },
      Inactive: { variant: "danger", label: t("inactive") },
    };
    const config = statusMap[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get fuel type badge
  const getFuelTypeBadge = (fuelType: string) => {
    const fuelMap: Record<string, { color: string; icon: any }> = {
      Petrol: { color: "blue", icon: Fuel },
      Diesel: { color: "amber", icon: Fuel },
      Electric: { color: "green", icon: Fuel },
      Gasoline: { color: "purple", icon: Fuel },
    };
    const config = fuelMap[fuelType] || { color: "gray", icon: Fuel };
    const Icon = config.icon;
    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-green-50 text-green-700 border-green-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[config.color as keyof typeof colorClasses]}`}>
        <Icon size={12} />
        <span>{fuelType}</span>
      </div>
    );
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicleCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Vehicle>[] = [
    {
      header: t("vehicle_code"),
      accessorKey: "vehicleCode",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Car size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-sm text-gray-900">{item.vehicleCode}</span>
        </div>
      ),
    },
    { header: t("plate_number"), accessorKey: "plateNumber" },
    { header: t("model"), accessorKey: "model" },
    { header: t("type"), accessorKey: "type" },
    {
      header: t("fuel_type"),
      accessorKey: "fuelType",
      render: (item) => getFuelTypeBadge(item.fuelType),
    },
    {
      header: t("mileage"),
      accessorKey: "mileage",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Gauge size={14} className="text-gray-400" />
          <span className="text-sm">{item.mileage.toLocaleString()} km</span>
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
              setSelectedVehicle(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setVehicleIdToDelete(item._id);
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
    { value: "Active", label: t("active") },
    { value: "In Maintenance", label: t("in_maintenance") },
    { value: "Inactive", label: t("inactive") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("vehicles")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_your_vehicles")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={vehicles} filename="vehicles" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedVehicle(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_vehicle")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_placeholder")}
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
        data={filteredVehicles}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <VehicleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedVehicle={selectedVehicle}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_vehicle")}
        message={t("are_you_sure_delete_vehicle")}
      />
    </div>
  );
};