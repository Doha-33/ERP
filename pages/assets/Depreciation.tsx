import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calculator } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DepreciationFormModal } from "../../components/assets/DepreciationFormModal";
import { useData } from "../../context/DataContext";
import { Depreciation as DepreciationType, Asset } from "../../types";
import { toast } from "sonner";

export const Depreciation: React.FC = () => {
  const { t } = useTranslation();
  const {
    depreciations,
    assets,
    assetsLoading,
    addDepreciation,
    updateDepreciation,
    deleteDepreciation,
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepreciation, setSelectedDepreciation] =
    useState<DepreciationType | null>(null);
  const [depreciationIdToDelete, setDepreciationIdToDelete] = useState<
    string | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDepreciations = depreciations.filter((d) => {
    const asset = d.assetId as any;
    const assetName = asset?.assetName || "";
    const assetCode = asset?.assetCode || "";
    return (
      assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.depreciationCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSave = async (data: Partial<DepreciationType>) => {
    try {
      if (selectedDepreciation) {
        await updateDepreciation(
          selectedDepreciation._id || selectedDepreciation.id!,
          data,
        );
        toast.success(t("depreciation_updated_successfully"));
      } else {
        await addDepreciation(data);
        toast.success(t("depreciation_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save depreciation:", error);
      toast.error(t("failed_to_save_depreciation"));
    }
  };

  const handleDelete = async () => {
    if (!depreciationIdToDelete) return;
    try {
      await deleteDepreciation(depreciationIdToDelete);
      setIsDeleteModalOpen(false);
      setDepreciationIdToDelete(null);
      toast.success(t("depreciation_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete depreciation:", error);
      toast.error(t("failed_to_delete_depreciation"));
    }
  };

  // Get method badge
  const getMethodBadge = (method: string) => {
    const m = method?.toLowerCase();

    const methodMap = {
      "straight line": { label: t("straight_line"), color: "blue" },
      "declining balance": { label: t("declining_balance"), color: "amber" },
      "units of production": {
        label: t("units_of_production"),
        color: "green",
      },
    };

    const { label, color } = methodMap[m as keyof typeof methodMap] || {
      label: method || t("unknown"),
      color: "gray",
    };

    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      amber:
        "bg-amber-50 text-amber-700 border-amber-200",
      green:
        "bg-green-50 text-green-700 border-green-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
    };

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
      >
        <Calculator size={12} />
        <span>{label}</span>
      </div>
    );
  };

  const columns: Column<DepreciationType>[] = [
    { header: t("code"), accessorKey: "depreciationCode" },
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
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {name || t("unknown_asset")}
            </span>
          </div>
        );
      },
    },
    {
      header: t("purchase_cost"),
      render: (item) => `${item.purchaseCost?.toLocaleString()} SAR`,
    },
    { header: t("useful_life"), accessorKey: "usefulLife" },
    {
      header: t("depreciation_method"),
      accessorKey: "depreciationMethod",
      render: (item) => getMethodBadge(item.depreciationMethod),
    },
    {
      header: t("accumulated_depreciation"),
      render: (item) => `${item.accumulatedDepreciation?.toLocaleString()} SAR`,
    },
    {
      header: t("current_value"),
      render: (item) => `${item.currentValue?.toLocaleString()} SAR`,
    },
    {
      header: t("accounting_period"),
      accessorKey: "accountingPeriod",
      render: (item) => {
        const period = item.accountingPeriod?.toLowerCase();
        const periodMap = {
          month: { label: t("month"), color: "purple" },
          quarter: { label: t("quarter"), color: "orange" },
          year: { label: t("year"), color: "green" },
        };
        const { label, color } = periodMap[
          period as keyof typeof periodMap
        ] || {
          label: item.accountingPeriod || t("unknown"),
          color: "gray",
        };
        const colorClasses = {
          purple:
            "bg-purple-50 text-purple-700 border-purple-200",
          orange:
            "bg-orange-50 text-orange-700 border-orange-200",
          green:
            "bg-green-50 text-green-700 border-green-200",
          gray: "bg-gray-50 text-gray-700 border-gray-200",
        };
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[color as keyof typeof colorClasses]}`}
          >
            <span>{label}</span>
          </div>
        );
      },
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedDepreciation(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setDepreciationIdToDelete(item._id || item.id!);
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
            {t("depreciation")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manage_your_depreciation")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={depreciations} filename="depreciation" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedDepreciation(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_depreciation")}
          </Button>
        </div>
      </div>

      <div className="p-4 flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_depreciation")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      <Table
        columns={columns}
        data={filteredDepreciations}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <DepreciationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDepreciation={selectedDepreciation}
        assets={assets}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_depreciation")}
        message={t("are_you_sure_delete_depreciation")}
      />
    </div>
  );
};
