import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Tag, DollarSign, Percent, Filter, X, Users, Package } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PricingRuleModal } from "../../components/sales/PricingRuleModal";
import { useData } from "../../context/DataContext";
import { PricingRule } from "../../types";
import { toast } from "sonner";

export const PricingRules: React.FC = () => {
  const { t } = useTranslation();
  const { pricingRules, addPricingRule, updatePricingRule, deletePricingRule } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (rule: Partial<PricingRule>) => {
    try {
      setIsLoading(true);
      if (editingRule) {
        await updatePricingRule({ ...rule, _id: editingRule._id, id: editingRule.id } as PricingRule);
        toast.success(t("pricing_rule_updated_successfully"));
      } else {
        await addPricingRule(rule as PricingRule);
        toast.success(t("pricing_rule_created_successfully"));
      }
      setIsModalOpen(false);
      setEditingRule(null);
    } catch (error) {
      console.error("Error saving pricing rule:", error);
      toast.error(t("failed_to_save_pricing_rule"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((rule: PricingRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePricingRule(deleteId);
        toast.success(t("pricing_rule_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
      } catch (error) {
        toast.error(t("failed_to_delete_pricing_rule"));
      }
    }
  }, [deleteId, deletePricingRule, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePricingRule(id)));
      toast.success(t("pricing_rules_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_pricing_rules"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "Active" ? "success" : "danger"}>
        {status === "Active" ? t("active") : t("inactive")}
      </Badge>
    );
  };

  // Apply filters
  const filteredRules = useMemo(() => {
    return pricingRules.filter(r => {
      const matchesSearch = 
        r.ruleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.product?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || r.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pricingRules, searchTerm, statusFilter]);

  // Statistics
  const totalRules = filteredRules.length;
  const activeRules = filteredRules.filter(r => r.status === "ACTIVE").length;
  const inactiveRules = filteredRules.filter(r => r.status === "INACTIVE").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const columns: Column<PricingRule>[] = useMemo(
    () => [
      {
        header: t("rule_info"),
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{r.ruleName}</span>
              <span className="text-xs text-gray-500">{r.condition}</span>
            </div>
          </div>
        )
      },
      {
        header: t("applies_to"),
        render: (r) => (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Package size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{r.product || t("all_products")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{r.customer || t("all_customers")}</span>
            </div>
          </div>
        )
      },
      {
        header: t("price_change"),
        render: (r) => (
          <div className="flex items-center gap-1.5">
            <Percent size={14} className="text-green-600" />
            <span className="text-sm font-medium text-green-600">{r.priceChange}</span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (r) => getStatusBadge(r.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleEdit(r)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
              title={t("edit")}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(r._id || r.id)}
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
            {t("pricing_rules")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_pricing_rules")}
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
          <ExportDropdown data={filteredRules} filename="pricing-rules" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingRule(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_pricing_rule")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_rules")}</p>
              <p className="text-xl font-bold text-gray-900">{totalRules}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("active")}</p>
              <p className="text-xl font-bold text-green-600">{activeRules}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <Tag size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("inactive")}</p>
              <p className="text-xl font-bold text-red-600">{inactiveRules}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_pricing_rules")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

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

        {(statusFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
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
          data={filteredRules}
          columns={columns}
          keyExtractor={(item) => item._id || item.id}
          isLoading={isLoading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />

      {/* Modal */}
      <PricingRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSave}
        ruleToEdit={editingRule}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_pricing_rule")}
        message={t("are_you_sure_delete_pricing_rule")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_pricing_rules")}
        message={t("are_you_sure_delete_pricing_rules", { count: selectedIds.length })}
      />
    </div>
  );
};