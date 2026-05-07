import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, MapPin, Flag, Navigation } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { TripFormModal } from "../../components/fleet/TripModal";
import { fleetService } from "../../services/fleet.service";
import { Trip, Vehicle, Driver } from "../../types";
import { toast } from "sonner";

export const Trips: React.FC = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripIdToDelete, setTripIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsData, vehiclesData, driversData] = await Promise.all([
        fleetService.getTrips(),
        fleetService.getVehicles(),
        fleetService.getDrivers(),
      ]);
      setTrips(tripsData);
      setVehicles(vehiclesData);
      setDrivers(driversData);
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      toast.error(error.message || t("failed_to_fetch_data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<Trip>) => {
    try {
      if (selectedTrip) {
        await fleetService.updateTrip(selectedTrip._id, data);
        toast.success(t("trip_updated_successfully"));
      } else {
        await fleetService.createTrip(data);
        toast.success(t("trip_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error("Failed to save trip:", error);
      toast.error(error.message || t("failed_to_save_trip"));
    }
  };

  const handleDelete = async () => {
    if (!tripIdToDelete) return;
    try {
      await fleetService.deleteTrip(tripIdToDelete);
      setIsDeleteModalOpen(false);
      setTripIdToDelete(null);
      toast.success(t("trip_deleted_successfully"));
      await fetchData();
    } catch (error: any) {
      console.error("Failed to delete trip:", error);
      toast.error(error.message || t("failed_to_delete_trip"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "info" | "danger" | "neutral"; label: string }> = {
      Ongoing: { variant: "info", label: t("ongoing") },
      Completed: { variant: "success", label: t("completed") },
      Cancelled: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Calculate trip duration
  const getTripDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return "-";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} h`;
  };

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.tripCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.endLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<Trip>[] = [
    {
      header: t("trip_code"),
      accessorKey: "tripCode",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Navigation size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-sm text-gray-900">{item.tripCode}</span>
        </div>
      ),
    },
    {
      header: t("route"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-green-500" />
            <span className="text-sm">{item.startLocation}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flag size={14} className="text-red-500" />
            <span className="text-sm">{item.endLocation}</span>
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
      header: t("start_time"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm">{new Date(item.startTime).toLocaleDateString()}</span>
          <span className="text-xs text-gray-500">{new Date(item.startTime).toLocaleTimeString()}</span>
        </div>
      ),
    },
    {
      header: t("details"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t("fuel_used")}:</span>
            <span className="text-sm font-medium">{item.fuelUsed} L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{t("distance")}:</span>
            <span className="text-sm font-medium">{item.distance} km</span>
          </div>
          {item.endTime && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("duration")}:</span>
              <span className="text-sm font-medium">{getTripDuration(item.startTime, item.endTime)}</span>
            </div>
          )}
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
              setSelectedTrip(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setTripIdToDelete(item._id);
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
    { value: "Ongoing", label: t("ongoing") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("trips")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_your_trips")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={trips} filename="trips" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedTrip(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_trip")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_trip_placeholder")}
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
        data={filteredTrips}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <TripFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedTrip={selectedTrip}
        vehicles={vehicles}
        drivers={drivers}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_trip")}
        message={t("are_you_sure_delete_trip")}
      />
    </div>
  );
};