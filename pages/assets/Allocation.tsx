import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, MapPin, User } from "lucide-react";
import { Calendar, Clock, CheckCircle2, XCircle } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { AllocationFormModal } from "../../components/assets/AllocationFormModal";
import { useData } from "../../context/DataContext";
import { Allocation as AllocationType, Asset } from "../../types";
import { toast } from "sonner";

export const Allocation: React.FC = () => {
  const { t } = useTranslation();
  const {
    allocations,
    assets,
    assetsLoading,
    addAllocation,
    updateAllocation,
    deleteAllocation,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    useState<AllocationType | null>(null);
  const [allocationIdToDelete, setAllocationIdToDelete] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAllocations = allocations.filter((a) => {
    const asset = a.assetId as any;
    const assetName = asset?.assetName || "";
    const assetCode = asset?.assetCode || "";
    return (
      assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSave = async (data: Partial<AllocationType>) => {
    try {
      if (selectedAllocation) {
        await updateAllocation(
          selectedAllocation._id || selectedAllocation.id!,
          data,
        );
        toast.success(t("allocation_updated_successfully"));
      } else {
        await addAllocation(data);
        toast.success(t("allocation_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save allocation:", error);
      toast.error(t("failed_to_save_allocation"));
    }
  };

  const handleDelete = async () => {
    if (!allocationIdToDelete) return;
    try {
      await deleteAllocation(allocationIdToDelete);
      setIsDeleteModalOpen(false);
      setAllocationIdToDelete(null);
      toast.success(t("allocation_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete allocation:", error);
      toast.error(t("failed_to_delete_allocation"));
    }
  };

  // Get usage purpose badge
  const getUsagePurposeBadge = (purpose: string) => {
    const p = purpose?.toLowerCase();

    const purposeMap = {
      work: { label: t("work"), color: "blue" },
      production: { label: t("production"), color: "green" },
      maintenance: { label: t("maintenance"), color: "amber" },
      management: { label: t("management"), color: "purple" },
    };

    const { label, color } = purposeMap[p as keyof typeof purposeMap] || {
      label: purpose || t("unknown"),
      color: "gray",
    };

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      green: "bg-green-50 text-green-700 border-green-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      purple: "bg-purple-50 text-purple-700 border-purple-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <span>{label}</span>
      </div>
    );
  };

  // Get status badge based on dates
  const getStatusBadge = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) {
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{t("scheduled")}</span>
        </Badge>
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today < start) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock size={12} />
          <span>{t("upcoming")}</span>
        </Badge>
      );
    } else if (today > end) {
      return (
        <Badge variant="danger" className="flex items-center gap-1">
          <XCircle size={12} />
          <span>{t("expired")}</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>{t("active")}</span>
        </Badge>
      );
    }
  };
  const columns: Column<AllocationType>[] = [
    { header: t("code"), accessorKey: "allocationCode" },
    {
      header: t("asset"),
      render: (item) => {
        const asset = item.assetId as any;
        const foundAsset =
          typeof asset === "object"
            ? asset
            : assets.find((a) => (a._id || a.id) === asset);
        const name = foundAsset?.assetName || foundAsset?.name;
        return (
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">
              {name || t("unknown_asset")}
            </span>
          </div>
        );
      },
    },
    {
      header: t("assigned_to"),
      accessorKey: "assignedTo",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={12} className="text-blue-600" />
          </div>
          <span className="text-sm">{item.assignedTo}</span>
        </div>
      ),
    },
    {
      header: t("location"),
      accessorKey: "location",
      render: (item) => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-400" />
          <span className="text-sm">{item.location}</span>
        </div>
      ),
    },
    {
      header: t("start_date"),
      render: (item) =>
        item.startDate ? new Date(item.startDate).toLocaleDateString() : "-",
    },
    {
      header: t("end_date"),
      render: (item) =>
        item.endDate ? new Date(item.endDate).toLocaleDateString() : "-",
    },
    {
      header: t("usage_purpose"),
      accessorKey: "usagePurpose",
      render: (item) => getUsagePurposeBadge(item.usagePurpose),
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.startDate, item.endDate),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedAllocation(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setAllocationIdToDelete(item._id || item.id!);
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
            {t("allocation")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manage_your_allocation")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={allocations} filename="allocation" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAllocation(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_allocation")}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_allocation")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredAllocations}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <AllocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAllocation={selectedAllocation}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_allocation")}
        message={t("are_you_sure_delete_allocation")}
      />
    </div>
  );
};
