import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Tag, Percent, DollarSign, Gift, Truck, Calendar, Filter, X, Clock } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { PromotionModal } from "../../components/sales/PromotionModal";
import { useData } from "../../context/DataContext";
import { Promotion } from "../../types";
import { toast } from "sonner";

export const Promotions: React.FC = () => {
  const { t } = useTranslation();
  const { promotions, addPromotion, updatePromotion, deletePromotion, fetchPromotions } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  const handleSave = async (promotionData: Partial<Promotion>) => {
    try {
      setIsLoading(true);
      
      if (editingPromotion) {
        // Get the ID from editingPromotion
        const promotionId = extractId(editingPromotion);
        
        if (!promotionId) {
          toast.error(t("promotion_id_missing"));
          return;
        }
        
        // Create update data with ID
        const updateData = {
          ...promotionData,
          _id: promotionId,
          id: promotionId
        } as Promotion;
        
        console.log("Updating promotion with ID:", promotionId, updateData);
        await updatePromotion(updateData);
        toast.success(t("promotion_updated_successfully"));
      } else {
        await addPromotion(promotionData as Promotion);
        toast.success(t("promotion_created_successfully"));
      }
      
      await fetchPromotions(); // Refresh list
      setIsModalOpen(false);
      setEditingPromotion(null);
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_promotion");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((promotion: Promotion) => {
    // Extract ID correctly from the promotion object
    const promotionId = extractId(promotion);
    
    if (!promotionId) {
      console.error("Promotion ID not found", promotion);
      toast.error(t("promotion_id_not_found"));
      return;
    }
    
    // Create a clean promotion object with proper ID
    const promotionToEdit: Promotion = {
      ...promotion,
      _id: promotionId,
      id: promotionId,
    };
    
    console.log("Editing promotion:", promotionToEdit);
    setEditingPromotion(promotionToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deletePromotion(deleteId);
        toast.success(t("promotion_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchPromotions();
      } catch (error) {
        toast.error(t("failed_to_delete_promotion"));
      }
    }
  }, [deleteId, deletePromotion, fetchPromotions, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deletePromotion(id)));
      toast.success(t("promotions_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchPromotions();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_promotions"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
      ACTIVE: { variant: "success", label: t("active") },
      SCHEDULED: { variant: "warning", label: t("scheduled") },
      EXPIRED: { variant: "danger", label: t("expired") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent size={14} className="text-blue-500" />;
      case "FIXED":
        return <DollarSign size={14} className="text-green-500" />;
      case "BUY_X_GET_Y":
        return <Gift size={14} className="text-purple-500" />;
      case "FREE_SHIPPING":
        return <Truck size={14} className="text-orange-500" />;
      default:
        return <Tag size={14} className="text-gray-500" />;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t("ongoing");
    return new Date(dateStr).toLocaleDateString();
  };

  // Apply filters
  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      const matchesSearch = 
        p.promotionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.benefitDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesType = !typeFilter || p.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const totalPromotions = filteredPromotions.length;
  const activePromotions = filteredPromotions.filter(p => p.status === "ACTIVE").length;
  const scheduledPromotions = filteredPromotions.filter(p => p.status === "SCHEDULED").length;
  const percentagePromotions = filteredPromotions.filter(p => p.type === "PERCENTAGE").length;

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "SCHEDULED", label: t("scheduled") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "PERCENTAGE", label: t("percentage") },
    { value: "FIXED", label: t("fixed_amount") },
    { value: "BUY_X_GET_Y", label: t("buy_x_get_y") },
    { value: "FREE_SHIPPING", label: t("free_shipping") },
  ];

  const columns: Column<Promotion>[] = useMemo(
    () => [
      {
        header: t("promotion_info"),
        render: (p) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{p.promotionName}</span>
              <div className="flex items-center gap-1 mt-0.5">
                {getTypeIcon(p.type)}
                <span className="text-xs text-gray-500">
                  {p.type === "PERCENTAGE" ? `${p.value}%` :
                   p.type === "FIXED" ? `${p.value} EGP` :
                   p.type === "BUY_X_GET_Y" ? t("buy_x_get_y") :
                   t("free_shipping")}
                </span>
              </div>
            </div>
          </div>
        )
      },
      {
        header: t("condition"),
        render: (p) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {p.conditionType === "ORDER_TOTAL" ? t("order_total") :
               p.conditionType === "PROMO_CODE" ? t("promo_code") :
               p.conditionType === "PRODUCT" ? t("specific_product") :
               t("customer_type")}
            </span>
            {p.conditionType === "PROMO_CODE" && (p as any).promoCode && (
              <span className="text-xs font-mono text-indigo-600">{(p as any).promoCode}</span>
            )}
            {p.conditionType === "ORDER_TOTAL" && (
              <span className="text-xs text-gray-500">{t("min_total")}: {p.value} EGP</span>
            )}
          </div>
        )
      },
      {
        header: t("benefit"),
        render: (p) => (
          <span className="text-sm text-gray-600 line-clamp-1">{p.benefitDescription}</span>
        )
      },
      {
        header: t("validity"),
        render: (p) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatDate(p.startDate)} → {formatDate(p.endDate)}
            </span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (p) => getStatusBadge(p.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (p) => {
          const promotionId = extractId(p);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(promotionId)}
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
    [t, handleEdit, handleDelete, extractId]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("promotions")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_promotions")}
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
          <ExportDropdown data={filteredPromotions} filename="promotions" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingPromotion(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_promotion")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_promotions")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalPromotions}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("percentage")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{percentagePromotions}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activePromotions}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("scheduled")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{scheduledPromotions}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_promotions")}
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

        {(statusFilter || typeFilter || searchTerm) && (
          <button
            onClick={() => {
              setStatusFilter("");
              setTypeFilter("");
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
        data={filteredPromotions}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPromotion(null);
        }}
        onSave={handleSave}
        promotionToEdit={editingPromotion}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_promotion")}
        message={t("are_you_sure_delete_promotion")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_promotions")}
        message={t("are_you_sure_delete_promotions", { count: selectedIds.length })}
      />
    </div>
  );
};