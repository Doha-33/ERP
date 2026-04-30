import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Plus, Search, Edit2, Trash2, Wrench, 
  Clock, Settings, DollarSign, Hash,
  Activity
} from "lucide-react";
import {
  Button,
  Input,
  ExportDropdown,
  Badge,
} from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { OperationFormModal } from "../../components/manufacturing/OperationFormModal";
import {manufacturingService} from "../../services/manufacturing.service";
import { Operation as OpType } from "../../types";
import { toast } from "sonner";

export const Operations: React.FC = () => {
  const { t } = useTranslation();
  const [operations, setOperations] = useState<OpType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OpType | null>(null);
  const [operationIdToDelete, setOperationIdToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const data = await manufacturingService.getOperations();
      setOperations(data);
    } catch (error) {
      console.error("Failed to fetch operations:", error);
      toast.error(t("failed_to_fetch_operations"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, []);

  const handleSave = async (data: Partial<OpType>) => {
    try {
      if (selectedOperation) {
        await manufacturingService.updateOperation(selectedOperation._id, data);
        toast.success(t("operation_updated_successfully"));
      } else {
        await manufacturingService.createOperation(data);
        toast.success(t("operation_created_successfully"));
      }
      setIsModalOpen(false);
      await fetchOperations();
    } catch (error) {
      console.error("Failed to save operation:", error);
      toast.error(t("failed_to_save_operation"));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!operationIdToDelete) return;
    try {
      await manufacturingService.deleteOperation(operationIdToDelete);
      setIsDeleteModalOpen(false);
      setOperationIdToDelete(null);
      toast.success(t("operation_deleted_successfully"));
      await fetchOperations();
    } catch (error) {
      console.error("Failed to delete operation:", error);
      toast.error(t("failed_to_delete_operation"));
    }
  };

  const filteredOperations = operations.filter((op) =>
    op.operation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.operation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.work_center?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<OpType>[] = [
    {
      header: t("operation_id"),
      accessorKey: "operation_id",
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Hash size={14} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm text-gray-900">{item.operation_id}</span>
            <span className="text-xs text-gray-500">{item.work_center}</span>
          </div>
        </div>
      ),
    },
    {
      header: t("operation_name"),
      accessorKey: "operation_name",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Wrench size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-900">{item.operation_name}</span>
        </div>
      ),
    },
    {
      header: t("duration"),
      accessorKey: "duration",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm">
            {item.duration} {t("min")}
          </span>
        </div>
      ),
    },
    {
      header: t("sequence"),
      accessorKey: "sequence",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-gray-400" />
          <span className="text-sm font-medium">
            #{item.sequence}
          </span>
        </div>
      ),
    },
    {
      header: t("cost"),
      accessorKey: "cost",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">
            {item.cost?.toLocaleString()} EGP
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
              setSelectedOperation(item);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors border border-gray-200 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              setOperationIdToDelete(item._id);
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

  // Summary statistics
  const totalOperations = operations.length;
  const totalCost = operations.reduce((sum, op) => sum + (op.cost || 0), 0);
  const avgDuration = operations.reduce((sum, op) => sum + (op.duration || 0), 0) / (operations.length || 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("operations")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_operations")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={operations} filename="operations" />
          <Button
            variant="primary"
            onClick={() => {
              setSelectedOperation(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_operation")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Settings size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_operations")}</p>
              <p className="text-xl font-bold text-gray-900">{totalOperations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_cost")}</p>
              <p className="text-xl font-bold text-gray-900">{totalCost.toLocaleString()} EGP</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_duration")}</p>
              <p className="text-xl font-bold text-gray-900">{avgDuration.toFixed(1)} {t("min")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder={t("search_operation_placeholder")}
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
        data={filteredOperations}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        selectable
      />

      {/* Add/Edit Modal */}
      <OperationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOperation(null);
        }}
        selectedOperation={selectedOperation}
        onSave={handleSave}
        loading={loading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("delete_operation")}
        message={t("are_you_sure_delete_operation")}
      />
    </div>
  );
};