import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, DollarSign, Calendar, User, Target, Filter, X, TrendingUp, Briefcase } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DealModal } from "../../components/crm/DealModal";
import { useCRM } from "../../context/crm/CRMContext";
import { CRMDeal } from "../../types";
import { toast } from "sonner";

export const Deals: React.FC = () => {
  const { t } = useTranslation();
  const { deals, loading, addDeal, updateDeal, deleteDeal } = useCRM();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CRMDeal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (deal: Partial<CRMDeal>) => {
    try {
      setIsLoading(true);
      if (editingDeal) {
        await updateDeal(editingDeal.id || editingDeal._id!, deal);
        toast.success(t("deal_updated_successfully"));
      } else {
        await addDeal(deal);
        toast.success(t("deal_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingDeal(null);
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error(t("failed_to_save_deal"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((deal: CRMDeal) => {
    setEditingDeal(deal);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteDeal(deleteId);
        toast.success(t("deal_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_deal"));
      }
    }
  }, [deleteId, deleteDeal, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteDeal(id)));
      toast.success(t("deals_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_deals"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredDeals = useMemo(() => {
    return deals.filter(d => {
      const matchesSearch = 
        d.dealName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.salesOwner?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStage = !stageFilter || d.stage === stageFilter;
      
      return matchesSearch && matchesStage;
    });
  }, [deals, searchTerm, stageFilter]);

  // Statistics
  const totalDeals = filteredDeals.length;
  const totalValue = filteredDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);
  const wonDeals = filteredDeals.filter(d => d.stage === "Closed Won").length;
  const lostDeals = filteredDeals.filter(d => d.stage === "Closed Lost").length;
  const inProgressDeals = filteredDeals.filter(d => d.stage !== "Closed Won" && d.stage !== "Closed Lost").length;
  const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

  const getStageBadge = (stage: string) => {
    const stageMap: Record<string, { variant: "success" | "danger" | "warning" | "info" | "purple"; label: string }> = {
      "Won": { variant: "success", label: t("closed_won") },
      "Lost": { variant: "danger", label: t("closed_lost") },
      "Proposal": { variant: "info", label: t("proposal") },
      "Negotiation": { variant: "warning", label: t("negotiation") },
    };
    const config = stageMap[stage] || { variant: "info", label: stage };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stageOptions = [
    { value: "", label: t("all_stages") },
    { value: "Proposal", label: t("proposal") },
    { value: "Negotiation", label: t("negotiation") },
    { value: "Won", label: t("closed_won") },
    { value: "Lost", label: t("closed_lost") },
  ];

  const columns: Column<CRMDeal>[] = useMemo(
    () => [
      {
        header: t("deal_info"),
        render: (d) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-500" />
              <span className="font-medium text-gray-900">{d.dealName}</span>
            </div>
            <span className="text-xs text-gray-500 ml-6">{d.customer}</span>
          </div>
        )
      },
      {
        header: t("value"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="font-semibold text-green-600">{d.dealValue?.toLocaleString()} EGP</span>
          </div>
        )
      },
      {
        header: t("stage"),
        render: (d) => getStageBadge(d.stage)
      },
      {
        header: t("closing_date"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {d.closingDate ? new Date(d.closingDate).toLocaleDateString() : "-"}
            </span>
          </div>
        )
      },
      {
        header: t("sales_owner"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">{d.salesOwner}</span>
          </div>
        )
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (d) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(d)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(d.id || d._id!)}
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
            {t("deals")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_crm_deals")}
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
          <ExportDropdown data={filteredDeals} filename="deals" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingDeal(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_deal")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_deals")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalDeals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_value")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalValue.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("in_progress")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{inProgressDeals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("closed_won")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{wonDeals}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-red-500" />
            <p className="text-xs text-gray-500">{t("closed_lost")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{lostDeals}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_deals")}
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
          data={filteredDeals}
          columns={columns}
          keyExtractor={(item) => item.id || item._id!}
          isLoading={loading || isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDeal(null);
        }}
        onSave={handleSave}
        dealToEdit={editingDeal}
        isLoading={loading || isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_deal")}
        message={t("are_you_sure_delete_deal")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_deals")}
        message={t("are_you_sure_delete_deals", { count: selectedIds.length })}
      />
    </div>
  );
};