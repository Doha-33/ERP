import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  Clock,
  Zap,
  AlertCircle,
  Gauge,
  Target,
  MapPin,
} from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { WorkCenterFormModal } from "../../components/manufacturing/WorkCenterFormModal";
import { manufacturingService } from "../../services/manufacturing.service";
import { WorkCenter as WCType } from "../../types";
import { toast } from "sonner";

export const WorkCenters: React.FC = () => {
  const { t } = useTranslation();
  const [workCenters, setWorkCenters] = useState<WCType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkCenter, setSelectedWorkCenter] = useState<WCType | null>(
    null,
  );
  const [workCenterIdToDelete, setWorkCenterIdToDelete] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchWorkCenters = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getWorkCenters();
      setWorkCenters(data);
    } catch (error) {
      console.error("Failed to fetch work centers:", error);
      toast.error(t("failed_to_fetch_wc"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkCenters();
  }, []);

  const handleSave = async (data: Partial<WCType>) => {
    try {
      if (selectedWorkCenter) {
        await manufacturingService.updateWorkCenter(
          selectedWorkCenter._id,
          data,
        );
        toast.success(t("wc_updated_successfully"));
      } else {
        await manufacturingService.createWorkCenter(data);
        toast.success(t("wc_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchWorkCenters();
    } catch (error) {
      console.error("Failed to save work center:", error);
      toast.error(t("failed_to_save_wc"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!workCenterIdToDelete) return;
    try {
      await manufacturingService.deleteWorkCenter(workCenterIdToDelete);
      setIsDeleteModalOpen(false);
      setWorkCenterIdToDelete(null);
      toast.success(t("wc_deleted_successfully"));
      await fetchWorkCenters();
    } catch (error) {
      console.error("Failed to delete work center:", error);
      toast.error(t("failed_to_delete_wc"));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        variant: "success" | "warning" | "danger" | "neutral";
        label: string;
        icon: any;
      }
    > = {
      Active: { variant: "success", label: t("active"), icon: Zap },
      Maintenance: { variant: "warning", label: t("maintenance"), icon: Clock },
      Inactive: { variant: "danger", label: t("inactive"), icon: AlertCircle },
    };
    const config = statusMap[status] || {
      variant: "neutral",
      label: status,
      icon: null,
    };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  // Summary statistics
  const totalWC = workCenters.length;
  const activeWC = workCenters.filter((wc) => wc.state === "Active").length;
  const avgCapacity =
    workCenters.length > 0
      ? (
          workCenters.reduce((acc, curr) => acc + (curr.capacity || 0), 0) /
          workCenters.length
        ).toFixed(1)
      : 0;
  const avgEfficiency =
    workCenters.length > 0
      ? (
          workCenters.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) /
          workCenters.length
        ).toFixed(1)
      : 0;

  // Helper function to extract capacity
  const getCapacity = (wc: any): number => {
    return wc.capacity_per_hour || wc.capacity || 0;
  };

  // Helper function to get code (supports both 'code' and 'work_center_id')
  const getCode = (wc: any): string => {
    return wc.code || wc.work_center_id || "";
  };

  // Helper function to get name
  const getName = (wc: any): string => {
    return wc.name || "";
  };

  // Helper function to get location
  const getLocation = (wc: any): string => {
    return wc.location || "";
  };

  // Helper function to get state
  const getState = (wc: any): string => {
    return wc.state || wc.status || "Unknown";
  };

  // Update filteredWorkCenters
  const filteredWorkCenters = workCenters.filter((wc) => {
    const matchesSearch =
      getName(wc).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCode(wc).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocation(wc).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || getState(wc) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Update columns to use helper functions
  const columns: Column<WCType>[] = [
    {
      header: t("code"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building2 size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {getCode(item)}
            </span>
            <span className="text-xs text-gray-500">{getName(item)}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("performance"),
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Gauge size={14} className="text-gray-400" />
            <span className="text-sm">
              {t("capacity")}: {getCapacity(item).toLocaleString()}/hr
            </span>
          </div>
        </div>
      ),
    },
    {
      header: t("machine_type"),
      render: (item) => {
        const machineType = (item as any).machine_type || "MANUAL";
        const typeMap: Record<string, { label: string }> = {
          MANUAL: { label: t("manual") },
          SEMI_AUTOMATIC: { label: t("semi_automatic") },
          AUTOMATIC: { label: t("automatic") },
          CNC: { label: t("cnc") },
          ROBOTIC: { label: t("robotic") },
        };
        return (
          <Badge variant="info" className="bg-gray-100 text-gray-700">
            {typeMap[machineType]?.label || machineType}
          </Badge>
        );
      },
    },
    {
      header: t("location"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-sm">{getLocation(item) || "-"}</span>
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
              setSelectedWorkCenter(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setWorkCenterIdToDelete(item._id);
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
    { value: "Maintenance", label: t("maintenance") },
    { value: "Inactive", label: t("inactive") },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("work_centers")}
          </h1>
          <p className="text-gray-500 mt-1">{t("manage_your_wc")}</p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={workCenters} filename="work-centers" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedWorkCenter(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_wc")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_work_centers")}</p>
              <p className="text-xl font-bold text-gray-900">{totalWC}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {t("active_work_centers")}
              </p>
              <p className="text-xl font-bold text-gray-900">{activeWC}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Gauge size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_capacity")}</p>
              <p className="text-xl font-bold text-gray-900">{avgCapacity}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_efficiency")}</p>
              <p className="text-xl font-bold text-gray-900">
                {avgEfficiency}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_wc_placeholder")}
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
        data={filteredWorkCenters}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      {/* Add/Edit Modal */}
      <WorkCenterFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkCenter(null);
        }}
        selectedWorkCenter={selectedWorkCenter}
        onSave={handleSave}
        loading={loading}
        existingWorkCenters={workCenters} // Add this line
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_wc")}
        message={t("are_you_sure_delete_wc")}
      />
    </div>
  );
};
