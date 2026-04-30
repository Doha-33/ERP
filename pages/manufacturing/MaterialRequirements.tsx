import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Package, 
  Search, 
  Edit2, 
  Trash2, 
  ShoppingCart, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  FileText,
  Plus,
  Box,
  AlertCircle
} from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { MaterialRequirementFormModal } from "../../components/manufacturing/MaterialRequirementFormModal";
import {manufacturingService} from "../../services/manufacturing.service";
import { MaterialRequirement as MRType } from "../../types";
import { toast } from "sonner";

export const MaterialRequirements: React.FC = () => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState<MRType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<MRType | null>(null);
  const [requirementIdToDelete, setRequirementIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getMaterialRequirements();
      setRequirements(data);
    } catch (error) {
      console.error("Failed to fetch material requirements:", error);
      toast.error(t("failed_to_fetch_mr"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const handleSave = async (data: Partial<MRType>) => {
    try {
      if (selectedRequirement) {
        await manufacturingService.updateMaterialRequirement(selectedRequirement._id, data);
        toast.success(t("mr_updated_successfully"));
      } else {
        await manufacturingService.createMaterialRequirement(data);
        toast.success(t("mr_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchRequirements();
    } catch (error) {
      console.error("Failed to save material requirement:", error);
      toast.error(t("failed_to_save_mr"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!requirementIdToDelete) return;
    try {
      await manufacturingService.deleteMaterialRequirement(requirementIdToDelete);
      setIsDeleteModalOpen(false);
      setRequirementIdToDelete(null);
      toast.success(t("mr_deleted_successfully"));
      await fetchRequirements();
    } catch (error) {
      console.error("Failed to delete material requirement:", error);
      toast.error(t("failed_to_delete_mr"));
    }
  };

  const handlePurchase = (item: MRType) => {
    toast.info(t("purchase_order_created", { material: item.material }));
  };

  const filteredRequirements = requirements.filter((req) =>
    req.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Summary statistics
  const totalAvailable = requirements.reduce((acc, curr) => acc + (curr.available_qty || 0), 0);
  const totalRequired = requirements.reduce((acc, curr) => acc + (curr.required_qty || 0), 0);
  const totalShortage = requirements.reduce((acc, curr) => acc + Math.max(0, (curr.required_qty || 0) - (curr.available_qty || 0)), 0);
  const materialsWithShortage = requirements.filter(req => (req.required_qty || 0) > (req.available_qty || 0)).length;

  const columns: Column<MRType>[] = [
    {
      header: t("material"),
      accessorKey: "material",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Package size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.material}</span>
            <span className="text-xs text-gray-500">{item.unit}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("description"),
      accessorKey: "description",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 truncate max-w-xs">
            {item.description || "-"}
          </span>
        </div>
      ),
    },
    {
      header: t("quantity"),
      render: (item) => {
        const shortage = Math.max(0, (item.required_qty || 0) - (item.available_qty || 0));
        const isShortage = shortage > 0;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t("required")}:</span>
              <span className="text-sm font-medium">{item.required_qty?.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t("available")}:</span>
              <span className={`text-sm font-medium ${isShortage ? 'text-red-500' : 'text-green-600'}`}>
                {item.available_qty?.toLocaleString()}
              </span>
            </div>
            {isShortage && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t("shortage")}:</span>
                <span className="text-sm font-bold text-red-600">{shortage.toLocaleString()}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: t("source"),
      accessorKey: "source",
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.source}
        </Badge>
      ),
    },
    {
      header: t("status"),
      render: (item) => {
        const shortage = Math.max(0, (item.required_qty || 0) - (item.available_qty || 0));
        if (shortage === 0) {
          return (
            <Badge variant="success" className="flex items-center gap-1 w-fit">
              <CheckCircle2 size={12} />
              {t("sufficient")}
            </Badge>
          );
        }
        return (
          <Badge variant="danger" className="flex items-center gap-1 w-fit">
            <AlertCircle size={12} />
            {t("shortage")}
          </Badge>
        );
      },
    },
    {
      header: t("actions"),
      render: (item) => {
        const shortage = Math.max(0, (item.required_qty || 0) - (item.available_qty || 0));
        return (
          <div className="flex items-center gap-2">
            {shortage > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => handlePurchase(item)}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <ShoppingCart size={14} />
                {t("purchase")}
              </Button>
            )}
            <button
              onClick={() => {
                setSelectedRequirement(item);
                setIsModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                setRequirementIdToDelete(item._id);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const statusOptions = [
    { value: "all", label: t("all_materials") },
    { value: "shortage", label: t("has_shortage") },
    { value: "sufficient", label: t("sufficient") },
  ];

  const getFilteredItems = () => {
    if (statusFilter === "all") return filteredRequirements;
    if (statusFilter === "shortage") {
      return filteredRequirements.filter(req => (req.required_qty || 0) > (req.available_qty || 0));
    }
    return filteredRequirements.filter(req => (req.required_qty || 0) <= (req.available_qty || 0));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("material_requirements")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_mfg_materials")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={requirements} filename="material-requirements" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedRequirement(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_requirement")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_available")}</p>
              <p className="text-xl font-bold text-gray-900">{totalAvailable.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_required")}</p>
              <p className="text-xl font-bold text-gray-900">{totalRequired.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_shortage")}</p>
              <p className="text-xl font-bold text-red-600">{totalShortage.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Box size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("materials_with_shortage")}</p>
              <p className="text-xl font-bold text-gray-900">{materialsWithShortage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_material_placeholder")}
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
        data={getFilteredItems()}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      {/* Add/Edit Modal */}
      <MaterialRequirementFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequirement(null);
        }}
        selectedRequirement={selectedRequirement}
        onSave={handleSave}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_requirement")}
        message={t("are_you_sure_delete_requirement")}
      />
    </div>
  );
};