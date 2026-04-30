import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, User, Phone, Award } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DriverFormModal } from "../../components/fleet/DriverModal";
import { fleetService } from "../../services/fleet.service";
import { Driver, Vehicle } from "../../types";
import { toast } from "sonner";

export const Drivers: React.FC = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverIdToDelete, setDriverIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [driversData, vehiclesData] = await Promise.all([
        fleetService.getDrivers(),
        fleetService.getVehicles(),
      ]);
      setDrivers(driversData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("failed_to_fetch_data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<Driver>) => {
    try {
      if (selectedDriver) {
        await fleetService.updateDriver(selectedDriver._id, data);
        toast.success(t("driver_updated_successfully"));
      } else {
        await fleetService.createDriver(data);
        toast.success(t("driver_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to save driver:", error);
      toast.error(t("failed_to_save_driver"));
    }
  };

  const handleDelete = async () => {
    if (!driverIdToDelete) return;
    try {
      await fleetService.deleteDriver(driverIdToDelete);
      setIsDeleteModalOpen(false);
      setDriverIdToDelete(null);
      toast.success(t("driver_deleted_successfully"));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete driver:", error);
      toast.error(t("failed_to_delete_driver"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "info" | "danger" | "neutral"; label: string }> = {
      Active: { variant: "success", label: t("active") },
      "On Trip": { variant: "info", label: t("on_trip") },
      Inactive: { variant: "danger", label: t("inactive") },
    };
    const config = statusMap[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Check license expiry status
  const getLicenseExpiryBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      return <Badge variant="danger">{t("expired")}</Badge>;
    } else if (daysLeft < 30) {
      return <Badge variant="warning">{t("expiring_soon", { days: daysLeft })}</Badge>;
    }
    return <Badge variant="success">{t("valid")}</Badge>;
  };

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Driver>[] = [
    {
      header: t("driver_code"),
      accessorKey: "driverCode",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.driverCode}</span>
            <span className="text-xs text-gray-500">{item.driverName}</span>
          </div>
        </div>
      ),
    },
    
    {
      header: t("license_info"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-gray-400" />
            <span className="text-sm">{item.licenseNumber}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-500">
              {new Date(item.licenseExpiry).toLocaleDateString()}
            </span>
            {getLicenseExpiryBadge(item.licenseExpiry)}
          </div>
        </div>
      ),
    },
    {
      header: t("phone"),
      accessorKey: "phone",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Phone size={14} className="text-gray-400" />
          <span className="text-sm">{item.phone}</span>
        </div>
      ),
    },
    {
      header: t("assigned_vehicle"),
      render: (item) => {
        const vehicle = typeof item.assignedVehicleId === "object" ? item.assignedVehicleId : null;
        return vehicle ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{vehicle.plateNumber}</span>
            <span className="text-xs text-gray-500">{vehicle.model}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("none")}</span>
        );
      },
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
              setSelectedDriver(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setDriverIdToDelete(item._id);
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
    { value: "On Trip", label: t("on_trip") },
    { value: "Inactive", label: t("inactive") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("drivers")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_your_drivers")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={drivers} filename="drivers" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDriver(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_driver")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_driver_placeholder")}
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
        data={filteredDrivers}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <DriverFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDriver={selectedDriver}
        vehicles={vehicles}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_driver")}
        message={t("are_you_sure_delete_driver")}
      />
    </div>
  );
};