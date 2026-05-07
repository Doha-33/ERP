import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Fuel, DollarSign, Gauge, MapPin, Calendar } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { FuelLogFormModal } from "../../components/fleet/FuelLogFormModal";
import { fleetService } from "../../services/fleet.service";
import { FuelLog, Vehicle, Driver } from "../../types";
import { toast } from "sonner";

export const FuelLogs: React.FC = () => {
  const { t } = useTranslation();
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<FuelLog | null>(null);
  const [logIdToDelete, setLogIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fuelLogsData, vehiclesData, driversData] = await Promise.all([
        fleetService.getFuelLogs(),
        fleetService.getVehicles(),
        fleetService.getDrivers(),
      ]);
      setFuelLogs(fuelLogsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || t("failed_to_fetch_fuel_logs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<FuelLog>) => {
    try {
      if (selectedLog) {
        await fleetService.updateFuelLog(selectedLog._id, data);
        toast.success(t("fuel_log_updated_successfully"));
      } else {
        await fleetService.createFuelLog(data);
        toast.success(t("fuel_log_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to save fuel log:", error);
      toast.error(error.message || t("failed_to_save_fuel_log"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!logIdToDelete) return;
    try {
      await fleetService.deleteFuelLog(logIdToDelete);
      setIsDeleteModalOpen(false);
      setLogIdToDelete(null);
      toast.success(t("fuel_log_deleted_successfully"));
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete fuel log:", error);
      toast.error(error.message || t("failed_to_delete_fuel_log"));
    }
  };

  // Calculate cost per liter
  const getCostPerLiter = (cost: number, quantity: number) => {
    if (quantity === 0) return 0;
    return cost / quantity;
  };

  const filteredLogs = fuelLogs.filter((l) =>
    l.station.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof l.vehicleId === "object" && l.vehicleId.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns: Column<FuelLog>[] = [
    {
      header: t("date"),
      accessorKey: "date",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Calendar size={14} className="text-blue-600" />
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
      header: t("quantity"),
      accessorKey: "quantity",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Fuel size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{item.quantity} L</span>
        </div>
      ),
    },
    {
      header: t("cost"),
      accessorKey: "cost",
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-gray-400" />
            <span className="text-sm font-medium">{item.cost.toLocaleString()} EGP</span>
          </div>
          <span className="text-xs text-gray-500">
            {getCostPerLiter(item.cost, item.quantity).toFixed(2)} EGP/L
          </span>
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
      header: t("station"),
      accessorKey: "station",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-sm">{item.station}</span>
        </div>
      ),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedLog(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setLogIdToDelete(item._id);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("fuel_logs")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("track_fuel_consumption")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={fuelLogs} filename="fuel-logs" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedLog(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_fuel_log")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_fuel_log_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredLogs}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <FuelLogFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
        selectedLog={selectedLog}
        vehicles={vehicles}
        drivers={drivers}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_fuel_log")}
        message={t("are_you_sure_delete_fuel_log")}
      />
    </div>
  );
};