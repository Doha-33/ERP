import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, DollarSign, Layers, Filter, X, TrendingUp, Target, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PipelineModal } from "../../components/crm/PipelineModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMPipeline } from "../../types";
import { toast } from "sonner";

export const Pipeline: React.FC = () => {
  const { t } = useTranslation();
  const { pipelines, loading, addPipeline, updatePipeline, deletePipeline } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState<CRMPipeline | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (pipeline: Partial<CRMPipeline>) => {
    try {
      setIsLoading(true);
      if (editingPipeline) {
        await updatePipeline(editingPipeline.id || editingPipeline._id!, pipeline);
        toast.success(t("pipeline_updated_successfully"));
      } else {
        await addPipeline(pipeline);
        toast.success(t("pipeline_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingPipeline(null);
    } catch (error) {
      console.error("Error saving pipeline:", error);
      toast.error(t("failed_to_save_pipeline"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((pipeline: CRMPipeline) => {
    setEditingPipeline(pipeline);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePipeline(deleteId);
        toast.success(t("pipeline_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_pipeline"));
      }
    }
  }, [deleteId, deletePipeline, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePipeline(id)));
      toast.success(t("pipelines_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_pipelines"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredPipelines = useMemo(() => {
    return pipelines.filter(p => {
      const matchesSearch = 
        p.pipelineName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = !stageFilter || p.stage === stageFilter;
      
      return matchesSearch && matchesStage;
    });
  }, [pipelines, searchTerm, stageFilter]);

  // Statistics
  const totalPipelines = filteredPipelines.length;
  const totalDealValue = filteredPipelines.reduce((sum, p) => sum + (p.totalDealValue || 0), 0);
  const totalDeals = filteredPipelines.reduce((sum, p) => sum + (p.numberOfDeals || 0), 0);
  const inPipelineCount = filteredPipelines.filter(p => p.stage === "In Pipeline").length;
  const winCount = filteredPipelines.filter(p => p.stage === "Win").length;
  const lostCount = filteredPipelines.filter(p => p.stage === "Lost").length;

  const getStageBadge = (stage: string) => {
    const stageMap: Record<string, { variant: "info" | "success" | "danger"; label: string; icon: any }> = {
      "In Pipeline": { variant: "info", label: t("in_pipeline"), icon: Clock },
      "Win": { variant: "success", label: t("win"), icon: CheckCircle },
      "Lost": { variant: "danger", label: t("lost"), icon: XCircle },
    };
    const config = stageMap[stage] || { variant: "info", label: stage, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const stageOptions = [
    { value: "", label: t("all_stages") },
    { value: "In Pipeline", label: t("in_pipeline") },
    { value: "Win", label: t("win") },
    { value: "Lost", label: t("lost") },
  ];

  const columns: Column<CRMPipeline>[] = useMemo(
    () => [
      {header: t("pipeline_code"),
        render: (p) => (
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-indigo-500" />
            <span className="font-medium text-gray-900">{p.pipelineCode}</span>
          </div>
        )
      },
      {
        header: t("pipeline_name"),
        render: (p) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Layers size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{p.pipelineName}</span>
              <span className="text-xs text-gray-500">{p.numberOfDeals} {t("deals")}</span>
            </div>
          </div>
        )
      },
      {
        header: t("total_value"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{p.totalDealValue?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("avg_deal_value"),
        render: (p) => {
          const avgValue = p.numberOfDeals > 0 ? p.totalDealValue / p.numberOfDeals : 0;
          return (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-blue-600" />
              <span className="text-sm text-gray-600">{avgValue.toLocaleString()} EGP</span>
            </div>
          );
        }
      },
      {
        header: t("stage"),
        render: (p) => getStageBadge(p.stage)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (p) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(p)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(p.id || p._id!)}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
              title={t("delete")}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      }
    ],
    [t, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("crm_pipeline")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_pipeline")}
          </p>
        </div>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button
              variant="danger"
              onClick={() => setIsBulkConfirmOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 size={18} />
              {t("delete_selected")} ({selectedIds.length})
            </Button>
          )}
          <ExportDropdown data={filteredPipelines} filename="pipeline" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingPipeline(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_pipeline")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_pipelines")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalPipelines}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_deal_value")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalDealValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_deals")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalDeals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-yellow-600" />
            <p className="text-xs text-gray-500">{t("in_pipeline")}</p>
          </div>
          <p className="text-xl font-bold text-yellow-600 mt-1">{inPipelineCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("win")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{winCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_pipeline")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {stageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(stageFilter || searchTerm) && (
          <button
            onClick={() => {
              setStageFilter("");
              setSearchTerm("");
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredPipelines}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <PipelineModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPipeline(null);
        }}
        onSave={handleSave}
        pipelineToEdit={editingPipeline}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_pipeline")}
        message={t("are_you_sure_delete_pipeline")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_pipelines")}
        message={t("are_you_sure_delete_pipelines", { count: selectedIds.length })}
      />
    </div>
  );
};