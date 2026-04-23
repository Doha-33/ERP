import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FilterX,
  Laptop,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Truck,
  UserCheck,
  Wrench,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  ExportDropdown,
  Select,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { useData } from "../../context/DataContext";
import { Asset } from "../../types";
import { toast } from "sonner";
import { AssetFormModal } from "../../components/assets/AssetFormModal";
export const AssetRegister: React.FC = () => {
  const { t } = useTranslation();
  const { assets, assetsLoading, addAsset, updateAsset, deleteAsset } =
    useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetIdToDelete, setAssetIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [purchaseDateFrom, setPurchaseDateFrom] = useState<string>("");
  const [purchaseDateTo, setPurchaseDateTo] = useState<string>("");

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = assets.map((asset) => asset.category).filter(Boolean);
    return ["all", ...new Set(categories)];
  }, [assets]);

  // Status options for Select component
  const statusOptions = [
    { value: "all", label: t("all") },
    { value: "present", label: t("present") },
    { value: "active", label: t("active") },
    { value: "in maintenance", label: t("in_maintenance") },
    { value: "retired", label: t("retired") },
    { value: "lost", label: t("lost") },
    { value: "scrap", label: t("scrap") },
  ];

  // Category options for Select component
  const categoryOptions = useMemo(() => {
    return uniqueCategories.map((cat) => ({
      value: cat,
      label: cat === "all" ? t("all") : cat,
    }));
  }, [uniqueCategories, t]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search filter
      const matchesSearch =
        (asset.assetName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (asset.assetCode?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (asset.serialNumber?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        );

      if (!matchesSearch) return false;

      // Status filter
      if (
        statusFilter !== "all" &&
        asset.state?.toLowerCase() !== statusFilter.toLowerCase()
      )
        return false;

      // Category filter
      if (categoryFilter !== "all" && asset.category !== categoryFilter)
        return false;

      // Purchase date range filter
      if (purchaseDateFrom && asset.purchaseDate) {
        const assetDate = new Date(asset.purchaseDate)
          .toISOString()
          .split("T")[0];
        if (assetDate < purchaseDateFrom) return false;
      }
      if (purchaseDateTo && asset.purchaseDate) {
        const assetDate = new Date(asset.purchaseDate)
          .toISOString()
          .split("T")[0];
        if (assetDate > purchaseDateTo) return false;
      }
      return true;
    });
  }, [
    assets,
    searchTerm,
    statusFilter,
    categoryFilter,
    purchaseDateFrom,
    purchaseDateTo,
  ]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setPurchaseDateFrom("");
    setPurchaseDateTo("");
  };

  const handleSave = async (
    data: Partial<Asset>,
    imageBase64?: string,
    attachments?: string[],
  ) => {
    try {
      const processedData = {
        ...data,
        image: imageBase64 || selectedAsset?.image || "",
        attachments: attachments || selectedAsset?.attachments || [],
      };

      if (selectedAsset) {
        await updateAsset(
          selectedAsset._id || selectedAsset.id!,
          processedData,
        );
        toast.success(t("asset_updated_successfully"));
      } else {
        await addAsset(processedData);
        toast.success(t("asset_added_successfully"));
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save asset:", error);
      toast.error(t("failed_to_save_asset"));
    }
  };

  const handleDelete = async () => {
    if (!assetIdToDelete) return;
    try {
      await deleteAsset(assetIdToDelete);
      setIsDeleteModalOpen(false);
      setAssetIdToDelete(null);
      toast.success(t("asset_deleted_successfully"));
    } catch (error) {
      console.error("Failed to delete asset:", error);
      toast.error(t("failed_to_delete_asset"));
    }
  };

  const getStatusBadge = (state: string) => {
    const s = state?.toLowerCase();

    const statusMap = {
      active: {
        icon: CheckCircle2,
        label: t("active"),
        color: "green",
      },
      present: {
        icon: UserCheck,
        label: t("present"),
        color: "green",
      },
      in_maintenance: {
        icon: Wrench,
        label: t("in_maintenance"),
        color: "amber",
      },
      "in maintenance": {
        icon: Wrench,
        label: t("in_maintenance"),
        color: "amber",
      },
      retired: {
        icon: Truck,
        label: t("retired"),
        color: "gray",
      },
      lost: {
        icon: HelpCircle,
        label: t("lost"),
        color: "red",
      },
      scrap: {
        icon: Trash2,
        label: t("scrap"),
        color: "red",
      },
    };

    const {
      icon: Icon,
      label,
      color,
    } = statusMap[s as keyof typeof statusMap] || statusMap.present;

    const colorClasses = {
      green:
        "bg-green-50 text-green-700 border-green-200",
      amber:
        "bg-amber-50 text-amber-700 border-amber-200",
      red: "bg-red-50 text-red-700 border-red-200",
      gray: "bg-gray-50 text-gray-700 border-gray-200",
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

  const columns: Column<Asset>[] = [
    { header: t("asset_code"), accessorKey: "assetCode" },
    {
      header: t("asset_name"),
      accessorKey: "assetName",
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.image ? (
            <img
              src={item.image}
              alt={item.assetName}
              className="w-8 h-8 rounded object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
              <Laptop size={16} />
            </div>
          )}
          <span>{item.assetName}</span>
        </div>
      ),
    },
    { header: t("category"), accessorKey: "category" },
    { header: t("warranty_period"), accessorKey: "warrantyPeriod" },
    { header: t("warranty_end_date"), accessorKey: "warrantyEndDate" },
    { header: t("warranty_number"), accessorKey: "warrantyNumber" },
    { header: t("barcode"), accessorKey: "barcode" },
    { header: t("purchase_date"), accessorKey: "purchaseDate" },
    { header: t("assigned_to"), accessorKey: "assignedTo" },
    { header: t("model"), accessorKey: "model" },
    { header: t("serial_number"), accessorKey: "serialNumber" },
    { header: t("brand"), accessorKey: "brand" },
    { header: t("location"), accessorKey: "location" },
    {
      header: t("notes"),
      accessorKey: "notes",
      render: (item) => (
        <div
          className="max-w-[200px] truncate cursor-help"
          title={item.notes || ""}
        >
          {item.notes
            ? `${item.notes.substring(0, 7)}${item.notes.length > 7 ? "..." : ""}`
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
              setSelectedAsset(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setAssetIdToDelete(item._id || item.id!);
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
            {t("asset_register")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("manage_your_asset_register")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={assets} filename="asset_register" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedAsset(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_asset_register")}
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Search and Clear Row */}
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <Input
            placeholder={t("search_assets")}
            icon={<Search size={18} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px]"
            fullWidth={false}
          />
          <Button onClick={clearAllFilters} className="gap-2 shrink-0">
            <FilterX size={16} />
            {t("clear_filters")}
          </Button>
        </div>

        {/* Filters Row - All in one row with responsive wrap */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select
              label={t("filter_by_status")}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
              fullWidth
            />
          </div>

          {/* Category Filter */}
          <div className="flex-1 min-w-[150px]">
            <Select
              label={t("filter_by_category")}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categoryOptions}
              fullWidth
            />
          </div>

          {/* Purchase Date From */}
          <div className="flex-1 min-w-[160px]">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
              {t("filter_by_purchase_date")}
            </label>
            <Input
              type="date"
              value={purchaseDateFrom}
              onChange={(e) => setPurchaseDateFrom(e.target.value)}
              fullWidth
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredAssets}
        keyExtractor={(item) => item._id || item.id!}
        isLoading={assetsLoading}
        selectable
      />

      <AssetFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedAsset={selectedAsset}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_asset")}
        message={t("are_you_sure_delete_asset")}
      />
    </div>
  );
};
