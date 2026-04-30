import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, User, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { BookingFormModal } from "../../components/fleet/BookingFormModal";
import { fleetService } from "../../services/fleet.service";
import { VehicleBooking as VehicleBookingType, Vehicle } from "../../types";
import { toast } from "sonner";

export const VehicleBooking: React.FC = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<VehicleBookingType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<VehicleBookingType | null>(null);
  const [bookingIdToDelete, setBookingIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, vehiclesData] = await Promise.all([
        fleetService.getBookings(),
        fleetService.getVehicles(),
      ]);
      setBookings(bookingsData);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("failed_to_fetch_bookings"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<VehicleBookingType>) => {
    try {
      if (selectedBooking) {
        await fleetService.updateBooking(selectedBooking._id, data);
        toast.success(t("booking_updated_successfully"));
      } else {
        await fleetService.createBooking(data);
        toast.success(t("booking_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to save booking:", error);
      toast.error(t("failed_to_save_booking"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!bookingIdToDelete) return;
    try {
      await fleetService.deleteBooking(bookingIdToDelete);
      setIsDeleteModalOpen(false);
      setBookingIdToDelete(null);
      toast.success(t("booking_deleted_successfully"));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete booking:", error);
      toast.error(t("failed_to_delete_booking"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info" | "neutral"; label: string; icon: any }> = {
      Approved: { variant: "success", label: t("approved"), icon: CheckCircle },
      Pending: { variant: "warning", label: t("pending"), icon: Clock },
      Rejected: { variant: "danger", label: t("rejected"), icon: XCircle },
      Completed: { variant: "info", label: t("completed"), icon: CheckCircle },
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

  // Check if booking is active/expired
  const getDateStatus = (startDate: string, endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) {
      return <span className="text-xs text-blue-600">Upcoming</span>;
    } else if (today > end) {
      return <span className="text-xs text-gray-400">Expired</span>;
    } else {
      return <span className="text-xs text-green-600">Active</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<VehicleBookingType>[] = [
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
      header: t("requested_by"),
      accessorKey: "requestedBy",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center">
            <User size={12} className="text-purple-600" />
          </div>
          <span className="text-sm font-medium">{item.requestedBy}</span>
        </div>
      ),
    },
    {
      header: t("booking_period"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm">
              {new Date(item.startDate).toLocaleDateString()}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-sm">
              {new Date(item.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-1">{getDateStatus(item.startDate, item.endDate)}</div>
        </div>
      ),
    },
    {
      header: t("purpose"),
      accessorKey: "purpose",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-gray-400" />
          <span className="text-sm max-w-xs truncate">{item.purpose}</span>
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
              setSelectedBooking(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setBookingIdToDelete(item._id);
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
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
    { value: "Completed", label: t("completed") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("vehicle_booking")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_vehicle_bookings")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={bookings} filename="vehicle-bookings" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedBooking(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_booking")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_booking_placeholder")}
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
        data={filteredBookings}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <BookingFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        selectedBooking={selectedBooking}
        vehicles={vehicles}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_booking")}
        message={t("are_you_sure_delete_booking")}
      />
    </div>
  );
};