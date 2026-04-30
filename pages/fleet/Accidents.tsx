import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, MapPin, DollarSign, Shield, Calendar } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { AccidentFormModal } from "../../components/fleet/AccidentFormModal";
import { fleetService } from "../../services/fleet.service";
import { Accident, Vehicle, Driver } from "../../types";
import { toast } from "sonner";

export const Accidents: React.FC = () => {
  const { t } = useTranslation();
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  const [accidentIdToDelete, setAccidentIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accidentsData, vehiclesData, driversData] = await Promise.all([
        fleetService.getAccidents(),
        fleetService.getVehicles(),
        fleetService.getDrivers(),
      ]);
      setAccidents(accidentsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
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

  const handleSave = async (data: Partial<Accident>) => {
    try {
      if (selectedAccident) {
        await fleetService.updateAccident(selectedAccident._id, data);
        toast.success(t("accident_updated_successfully"));
      } else {
        await fleetService.createAccident(data);
        toast.success(t("accident_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to save accident:", error);
      toast.error(t("failed_to_save_accident"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!accidentIdToDelete) return;
    try {
      await fleetService.deleteAccident(accidentIdToDelete);
      setIsDeleteModalOpen(false);
      setAccidentIdToDelete(null);
      toast.success(t("accident_deleted_successfully"));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete accident:", error);
      toast.error(t("failed_to_delete_accident"));
    }
  };

  // Get damage level badge
  const getDamageLevelBadge = (level: string) => {
    const levelMap: Record<string, { variant: "danger" | "warning" | "neutral" | "info"; label: string }> = {
      High: { variant: "danger", label: t("high") },
      Medium: { variant: "warning", label: t("medium") },
      Low: { variant: "info", label: t("low") },
    };
    const config = levelMap[level] || { variant: "neutral", label: level };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "danger" | "success" | "warning"; label: string }> = {
      Open: { variant: "danger", label: t("open") },
      Closed: { variant: "success", label: t("closed") },
      "Under Review": { variant: "warning", label: t("under_review") },
    };
    const config = statusMap[status] || { variant: "warning", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredAccidents = accidents.filter((a) => {
    const matchesSearch =
      a.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Accident>[] = [
    {
      header: t("date"),
      accessorKey: "date",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <Calendar size={14} className="text-red-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">
              {new Date(item.date).toLocaleDateString()}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(item.date).toLocaleTimeString()}
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
      header: t("driver"),
      render: (item) => {
        const driver = typeof item.driverId === "object" ? item.driverId : null;
        return driver ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{driver.driverName}</span>
            <span className="text-xs text-gray-500">{driver.driverCode}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("unknown")}</span>
        );
      },
    },
    {
      header: t("location"),
      accessorKey: "location",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-sm">{item.location}</span>
        </div>
      ),
    },
    {
      header: t("damage_level"),
      accessorKey: "damageLevel",
      render: (item) => getDamageLevelBadge(item.damageLevel),
    },
    {
      header: t("actual_cost"),
      accessorKey: "actualCost",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{item.actualCost.toLocaleString()} EGP</span>
        </div>
      ),
    },
    {
      header: t("insurance_provider"),
      accessorKey: "insuranceProvider",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-gray-400" />
          <span className="text-sm">{item.insuranceProvider}</span>
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
              setSelectedAccident(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setAccidentIdToDelete(item._id);
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
    { value: "Under Review", label: t("under_review") },
    { value: "Open", label: t("open") },
    { value: "Closed", label: t("closed") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("accidents")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_your_accidents")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={accidents} filename="accidents" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAccident(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_accident")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_accident_placeholder")}
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
        data={filteredAccidents}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <AccidentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAccident(null);
        }}
        selectedAccident={selectedAccident}
        vehicles={vehicles}
        drivers={drivers}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_accident")}
        message={t("are_you_sure_delete_accident")}
      />
    </div>
  );
};