import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Building2, Hash, Calendar } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { CostCenterFormModal } from "../../components/fleet/CostCenterFormModal";
import { fleetService } from "../../services/fleet.service";
import { CostCenter } from "../../types";
import { toast } from "sonner";

export const CostCenterManagement: React.FC = () => {
  const { t } = useTranslation();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [costCenterIdToDelete, setCostCenterIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getCostCenters();
      setCostCenters(data);
    } catch (error) {
      console.error("Failed to fetch cost centers:", error);
      toast.error(t("failed_to_fetch_cost_centers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: Partial<CostCenter>) => {
    try {
      if (selectedCostCenter) {
        await fleetService.updateCostCenter(selectedCostCenter._id, data);
        toast.success(t("cost_center_updated_successfully"));
      } else {
        await fleetService.createCostCenter(data);
        toast.success(t("cost_center_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error("Failed to save cost center:", error);
      toast.error(t("failed_to_save_cost_center"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!costCenterIdToDelete) return;
    try {
      await fleetService.deleteCostCenter(costCenterIdToDelete);
      setIsDeleteModalOpen(false);
      setCostCenterIdToDelete(null);
      toast.success(t("cost_center_deleted_successfully"));
      await fetchData();
    } catch (error) {
      console.error("Failed to delete cost center:", error);
      toast.error(t("failed_to_delete_cost_center"));
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "neutral"; label: string }> = {
      Active: { variant: "success", label: t("active") },
      Inactive: { variant: "danger", label: t("inactive") },
    };
    const config = statusMap[status] || { variant: "neutral", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredCostCenters = costCenters.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<CostCenter>[] = [
    {
      header: t("cost_center_code"),
      accessorKey: "code",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Hash size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.code}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("cost_center_name"),
      accessorKey: "name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{item.name}</span>
        </div>
      ),
    },
    {
      header: t("description"),
      accessorKey: "description",
      render: (item) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate">
            {item.description || "-"}
          </p>
        </div>
      ),
    },
    {
      header: t("status"),
      accessorKey: "status",
      render: (item) => getStatusBadge(item.status),
    },
    {
      header: t("created_at"),
      accessorKey: "createdAt",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCostCenter(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setCostCenterIdToDelete(item._id);
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
    { value: "Inactive", label: t("inactive") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("cost_center_management")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("manage_your_cost_center")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={costCenters} filename="cost-centers" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedCostCenter(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_cost_center")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_cost_center_placeholder")}
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
        data={filteredCostCenters}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      <CostCenterFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCostCenter(null);
        }}
        selectedCostCenter={selectedCostCenter}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_cost_center")}
        message={t("are_you_sure_delete_cost_center")}
      />
    </div>
  );
};