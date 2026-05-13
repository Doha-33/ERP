import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Calendar, Award, DollarSign, Filter, X, History, Star, Gift } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { ResponsesHistoryModal } from "../../components/hr/ResponsesHistoryModal";
import { RewardModal } from "../../components/hr/RewardModal";
import { useData } from "../../context/DataContext";
import { Reward } from "../../types";
import { toast } from "sonner";

export const Rewards: React.FC = () => {
  const { t } = useTranslation();
  const { rewards, addReward, updateReward, deleteReward, actionHistory, fetchActionHistory, employees, fetchRewards } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  const handleSave = async (rewardData: Partial<Reward>) => {
    try {
      setIsLoading(true);
      
      if (editingReward) {
        const rewardId = extractId(editingReward);
        
        if (!rewardId) {
          toast.error(t("reward_id_missing"));
          return;
        }
        
        const updateData = {
          ...rewardData,
          _id: rewardId,
          id: rewardId
        } as Reward;
        
        console.log("Updating reward with ID:", rewardId, updateData);
        await updateReward(updateData);
        toast.success(t("reward_updated_successfully"));
      } else {
        await addReward(rewardData as Reward);
        toast.success(t("reward_created_successfully"));
      }
      
      await fetchRewards();
      setIsModalOpen(false);
      setEditingReward(null);
    } catch (error: any) {
      console.error("Error saving reward:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_reward");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((reward: Reward) => {
    const rewardId = extractId(reward);
    
    if (!rewardId) {
      console.error("Reward ID not found", reward);
      toast.error(t("reward_id_not_found"));
      return;
    }
    
    const rewardToEdit: Reward = {
      ...reward,
      _id: rewardId,
      id: rewardId,
    };
    
    console.log("Editing reward:", rewardToEdit);
    setEditingReward(rewardToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteReward(deleteId);
        toast.success(t("reward_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchRewards();
      } catch (error) {
        toast.error(t("failed_to_delete_reward"));
      }
    }
  }, [deleteId, deleteReward, fetchRewards, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      const validIds = selectedIds.filter(id => id && typeof id === 'string');
      if (validIds.length === 0) {
        toast.error(t("no_valid_ids_selected"));
        return;
      }
      await Promise.all(validIds.map(id => deleteReward(id)));
      toast.success(t("rewards_deleted_successfully", { count: validIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchRewards();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_rewards"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHistory = async (id: string) => {
    await fetchActionHistory();
    const filteredHistory = actionHistory.filter(h => extractId(h.requestId) === id);
    setSelectedHistory(filteredHistory);
    setIsHistoryOpen(true);
  };

  // Helper functions
  const getEmployeeName = (reward: Reward): string => {
    if (typeof reward.employeeInfo === "object" && reward.employeeInfo !== null) {
      return (reward.employeeInfo as any)?.fullName || "-";
    }
    const employee = employees.find(e => extractId(e) === reward.employeeInfo);
    return employee?.fullName || reward.employeeName || "-";
  };

  const getEmployeeCode = (reward: Reward): string => {
    if (typeof reward.employeeInfo === "object" && reward.employeeInfo !== null) {
      return (reward.employeeInfo as any)?.employeeCode || "-";
    }
    const employee = employees.find(e => extractId(e) === reward.employeeInfo);
    return employee?.employeeCode || "-";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  // Apply filters
  const filteredRewards = useMemo(() => {
    return rewards.filter(r => {
      const employeeName = getEmployeeName(r).toLowerCase();
      const matchesSearch = 
        employeeName.includes(searchTerm.toLowerCase()) ||
        r.rewardsType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = !typeFilter || r.rewardsType === typeFilter;
      
      const rewardDate = new Date(r.rewardDate || r.date);
      const matchesDateFrom = !dateFrom || rewardDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || rewardDate <= new Date(dateTo);
      
      return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
    });
  }, [rewards, searchTerm, typeFilter, dateFrom, dateTo]);

  // Statistics
  const totalRewards = filteredRewards.length;
  const totalAmount = filteredRewards.reduce((sum, r) => sum + (r.rewardAmount || 0) + (r.bonus || 0) + (r.commissions || 0), 0);
  const performanceBonuses = filteredRewards.filter(r => r.rewardsType === "Performance Bonus").length;
  const spotRewards = filteredRewards.filter(r => r.rewardsType === "Spot Reward").length;

  // API expects: Performance Bonus, Spot Reward, Incentive Scheme, Annual Bonus, Other
  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "Performance Bonus", label: t("performance_bonus") },
    { value: "Spot Reward", label: t("spot_reward") },
    { value: "Incentive Scheme", label: t("incentive_scheme") },
    { value: "Annual Bonus", label: t("annual_bonus") },
    { value: "Other", label: t("other") },
  ];

  const columns: Column<Reward>[] = useMemo(
    () => [
      {
        header: t("employee"),
        render: (r) => {
          const employeeName = getEmployeeName(r);
          const employeeCode = getEmployeeCode(r);
          const initial = employeeName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Award size={18} className="text-green-600" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{employeeName}</span>
                <span className="text-xs text-gray-500">{employeeCode}</span>
              </div>
            </div>
          );
        }
      },
      {
        header: t("reward_info"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">{r.rewardsType || r.rewardType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{formatDate(r.rewardDate || r.date)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("amount_breakdown"),
        render: (r) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t("reward")}:</span>
              <span className="text-sm font-medium text-green-600">{r.rewardAmount?.toLocaleString()} EGP</span>
            </div>
            {r.bonus > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t("bonus")}:</span>
                <span className="text-sm font-medium text-blue-600">{r.bonus?.toLocaleString()} EGP</span>
              </div>
            )}
            {r.commissions > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{t("commissions")}:</span>
                <span className="text-sm font-medium text-purple-600">{r.commissions?.toLocaleString()} EGP</span>
              </div>
            )}
          </div>
        )
      },
      {
        header: t("total"),
        render: (r) => {
          const total = (r.rewardAmount || 0) + (r.bonus || 0) + (r.commissions || 0);
          return (
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-green-600" />
              <span className="text-sm font-bold text-green-600">{total.toLocaleString()} EGP</span>
            </div>
          );
        }
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (r) => {
          const rewardId = extractId(r);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleShowHistory(rewardId)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("history")}
              >
                <History size={16} />
              </button>
              <button
                onClick={() => handleEdit(r)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(rewardId)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg border border-gray-200 transition-colors"
                title={t("delete")}
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
      }
    ],
    [t, handleEdit, handleDelete, handleShowHistory, extractId]
  );

  const getKeyExtractor = useCallback((item: Reward) => {
    const id = extractId(item);
    return id || Math.random().toString();
  }, [extractId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award size={24} className="text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("rewards")}
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            {t("manage_rewards")}
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
          <ExportDropdown data={filteredRewards} filename="rewards" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingReward(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_reward")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_rewards")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalRewards}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            <p className="text-xs text-gray-500">{t("performance_bonus")}</p>
          </div>
          <p className="text-xl font-bold text-yellow-600 mt-1">{performanceBonuses}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-purple-500" />
            <p className="text-xs text-gray-500">{t("spot_reward")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{spotRewards}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_rewards")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {typeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(typeFilter || searchTerm) && (
          <button
            onClick={() => {
              setTypeFilter("");
              setDateFrom("");
              setDateTo("");
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
        data={filteredRewards}
        columns={columns}
        keyExtractor={getKeyExtractor}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modals */}
      <RewardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReward(null);
        }}
        onSave={handleSave}
        rewardToEdit={editingReward}
        isLoading={isLoading}
      />

      <ResponsesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={selectedHistory}
      />

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_reward")}
        message={t("are_you_sure_delete_reward")}
      />

      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_rewards")}
        message={t("are_you_sure_delete_rewards", { count: selectedIds.length })}
      />
    </div>
  );
};