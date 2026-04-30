import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Package, Hash, Box, Layers } from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { BOMFormModal } from "../../components/manufacturing/BOMFormModal";
import {manufacturingService} from "../../services/manufacturing.service";
import { BillOfMaterials as BOMType } from "../../types";
import { toast } from "sonner";

export const BillOfMaterials: React.FC = () => {
  const { t } = useTranslation();
  const [boms, setBoms] = useState<BOMType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState<BOMType | null>(null);
  const [bomIdToDelete, setBomIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getBOMs();
      setBoms(data);
    } catch (error) {
      console.error("Failed to fetch BOMs:", error);
      toast.error(t("failed_to_fetch_boms"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  const handleSave = async (data: Partial<BOMType>) => {
    try {
      if (selectedBOM) {
        await manufacturingService.updateBOM(selectedBOM._id, data);
        toast.success(t("bom_updated_successfully"));
      } else {
        await manufacturingService.createBOM(data);
        toast.success(t("bom_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchBOMs();
    } catch (error) {
      console.error("Failed to save BOM:", error);
      toast.error(t("failed_to_save_bom"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!bomIdToDelete) return;
    try {
      await manufacturingService.deleteBOM(bomIdToDelete);
      setIsDeleteModalOpen(false);
      setBomIdToDelete(null);
      toast.success(t("bom_deleted_successfully"));
      await fetchBOMs();
    } catch (error) {
      console.error("Failed to delete BOM:", error);
      toast.error(t("failed_to_delete_bom"));
    }
  };

  const filteredBOMs = boms.filter((bom) =>
    bom.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.bom_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bom.component_item?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<BOMType>[] = [
    {
      header: t("bom_id"),
      accessorKey: "bom_id",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Hash size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-sm text-gray-900">{item.bom_id}</span>
        </div>
      ),
    },
    {
      header: t("product_info"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Package size={14} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
          </div>
          <span className="text-xs text-gray-500 ml-5">{item.product_code}</span>
        </div>
      ),
    },
    {
      header: t("component"),
      accessorKey: "component_item",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Box size={14} className="text-gray-400" />
          <span className="text-sm">{item.component_item}</span>
        </div>
      ),
    },
    {
      header: t("quantity"),
      accessorKey: "qty",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Layers size={14} className="text-gray-400" />
          <span className="text-sm font-medium">
            {item.qty} {item.uom}
          </span>
        </div>
      ),
    },
    {
      header: t("version"),
      accessorKey: "version",
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.version}
        </Badge>
      ),
    },
    {
      header: t("actions"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedBOM(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setBomIdToDelete(item._id);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("bill_of_materials")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_bom")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={boms} filename="bill-of-materials" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedBOM(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_bom")}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_bom_placeholder")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          fullWidth={false}
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredBOMs}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      {/* Add/Edit Modal */}
      <BOMFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBOM(null);
        }}
        selectedBOM={selectedBOM}
        onSave={handleSave}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_bom")}
        message={t("are_you_sure_delete_bom")}
      />
    </div>
  );
};