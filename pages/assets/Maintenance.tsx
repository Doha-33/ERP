import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Wrench } from "lucide-react";
import { Button, Input, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { MaintenanceFormModal } from "../../components/assets/MaintenanceFormModal";
import { useData } from "../../context/DataContext";
import { Maintenance as MaintenanceType } from "../../types";
import { toast } from "sonner";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  ShieldCheck,
  Activity,
  Sparkles,
} from "lucide-react";

export const Maintenance: React.FC = () => {
  const { t } = useTranslation();
  const {
    maintenances,
    assets,
    assetsLoading,
    addMaintenance,
    updateMaintenance,
    deleteMaintenance,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<MaintenanceType | null>(null);
  const [maintenanceIdToDelete, setMaintenanceIdToDelete] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMaintenances = maintenances.filter((m) => {
    const asset = m.assetId as any;
    const assetName = asset?.assetName || "";
    const assetCode = asset?.assetCode || "";
    return (
      assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.technician?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  const getStatusBadge = (state: string) => {
    const s = state?.toLowerCase();

    const statusMap = {
      scheduled: {
        icon: Clock,
        label: t("scheduled"),
        color: "blue",
      },
      "in progress": {
        icon: AlertCircle,
        label: t("in_progress"),
        color: "amber",
      },
      completed: {
        icon: CheckCircle2,
        label: t("completed"),
        color: "green",
      },
      cancelled: {
        icon: XCircle,
        label: t("cancelled"),
        color: "red",
      },
    };

    const {
      icon: Icon,
      label,
      color,
    } = statusMap[s as keyof typeof statusMap] || statusMap.scheduled;

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      green: "bg-green-50 text-green-700 border-green-200",
      red: "bg-red-50 text-red-700 border-red-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <Icon size={12} />
        <span>{label}</span>
      </div>
    );
  };
  const handleSave = async (
    data: Partial<MaintenanceType>,
    attachments?: string[],
  ) => {
    try {
      const processedData = {
        ...data,
        attachments: attachments || selectedMaintenance?.attachments || [],
      };

      if (selectedMaintenance) {
        await updateMaintenance(
          selectedMaintenance._id || selectedMaintenance.id!,
          processedData,
        );
        toast.success(t("maintenance_updated_successfully"));
      } else {
        await addMaintenance(processedData);
        toast.success(t("maintenance_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save maintenance:", error);
      toast.error(t("failed_to_save_maintenance"));
    }
  };

  const handleDelete = async () => {
    if (!maintenanceIdToDelete) {
      toast.error("No maintenance ID found");
      return;
    }

    console.log("Deleting ID:", maintenanceIdToDelete);

    try {
      // استخدام deleteMaintenance من context بدل apiClient مباشرة
      const response = await deleteMaintenance(maintenanceIdToDelete);
      console.log("Delete response:", response);

      if (response?.success) {
        toast.success(t("maintenance_deleted_successfully"));
        setIsDeleteModalOpen(false);
        setMaintenanceIdToDelete(null);
        // No need to reload - context already updated the state
      } else {
        toast.error(response?.message || t("failed_to_delete_maintenance"));
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(
        error?.response?.data?.message || t("failed_to_delete_maintenance"),
      );
    }
  };

  const columns: Column<MaintenanceType>[] = [
    {
      header: t("maintenance_code"),
      accessorKey: "maintenanceCode",
    },
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
          <div className="flex flex-col text-sm text-gray-900 dark:text-white">
            <span className="font-medium">{name || t("unknown_asset")}</span>
          </div>
        );
      },
    },
    {
      header: t("maintenance_type"),
      accessorKey: "maintenanceType",
      render: (item) => {
        const type = item.maintenanceType?.toLowerCase();

        const typeMap = {
          preventive: {
            icon: ShieldCheck,
            label: t("preventive"),
            color: "blue",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600",
          },
          corrective: {
            icon: Settings,
            label: t("corrective"),
            color: "amber",
            bgColor: "bg-amber-50",
            textColor: "text-amber-600",
          },
          repair: {
            icon: Wrench,
            label: t("repair"),
            color: "orange",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600",
          },
          service: {
            icon: Sparkles,
            label: t("service"),
            color: "purple",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600",
          },
        };

        const {
          icon: Icon,
          label,
          bgColor,
          textColor,
        } = typeMap[type as keyof typeof typeMap] || {
          icon: Activity,
          label: item.maintenanceType || t("unknown"),
          bgColor: "bg-gray-50",
          textColor: "text-gray-600",
        };

        return (
          <div className={`flex items-center gap-2`}>
            <div
              className={`w-8 h-8 rounded ${bgColor} flex items-center justify-center ${textColor}`}
            >
              <Icon size={16} />
            </div>
            <span className="capitalize">{label}</span>
          </div>
        );
      },
    },
    {
      header: t("scheduled_date"),
      render: (item) =>
        item.scheduledDate
          ? new Date(item.scheduledDate).toLocaleDateString()
          : "-",
    },
    { header: t("technician"), accessorKey: "technician" },
    {
      header: t("description"),
      accessorKey: "description",
      render: (item) => (
        <div
          className="max-w-[200px] truncate cursor-help"
          title={item.description || ""}
        >
          {item.description
            ? `${item.description.substring(0, 7)}${item.description.length > 7 ? "..." : ""}`
            : "-"}
        </div>
      ),
    },
    {
      header: t("cost"),
      render: (item) => `${item.cost?.toLocaleString()} SAR`,
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
              setSelectedMaintenance(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              console.log("Delete button clicked - Item:", item);
              console.log("Item ID:", item._id || item.id);
              setMaintenanceIdToDelete(item._id || item.id!);
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
            {t("maintenance")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manage_your_maintenance")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={maintenances} filename="maintenance" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedMaintenance(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_maintenance")}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_maintenance")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredMaintenances}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedMaintenance={selectedMaintenance}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_maintenance")}
        message={
          <div>
            <p>{t("are_you_sure_delete_maintenance")}</p>
            {maintenanceIdToDelete && (
              <p className="text-sm text-gray-500 mt-2">
                {t("maintenance_code")}: {maintenanceIdToDelete}
              </p>
            )}
          </div>
        }
      />
    </div>
  );
};
