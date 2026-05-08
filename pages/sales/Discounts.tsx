import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Edit2, Trash2, Percent, DollarSign, Tag, Filter, X, Calendar, Users, Package, CheckCircle } from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { DiscountModal } from "../../components/sales/DiscountModal";
import { useData } from "../../context/DataContext";
import { Discount } from "../../types";
import { toast } from "sonner";

export const Discounts: React.FC = () => {
  const { t } = useTranslation();
  const { discounts, addDiscount, updateDiscount, deleteDiscount, fetchDiscounts } = useData();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
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

  const handleSave = async (discountData: Partial<Discount>) => {
    try {
      setIsLoading(true);
      
      if (editingDiscount) {
        // Get the ID from editingDiscount
        const discountId = extractId(editingDiscount);
        
        if (!discountId) {
          toast.error(t("discount_id_missing"));
          return;
        }
        
        // Create update data with ID
        const updateData = {
          ...discountData,
          _id: discountId,
          id: discountId
        } as Discount;
        
        console.log("Updating discount with ID:", discountId, updateData);
        await updateDiscount(updateData);
        toast.success(t("discount_updated_successfully"));
      } else {
        await addDiscount(discountData as Discount);
        toast.success(t("discount_created_successfully"));
      }
      
      await fetchDiscounts(); // Refresh list
      setIsModalOpen(false);
      setEditingDiscount(null);
    } catch (error: any) {
      console.error("Error saving discount:", error);
      const message = error?.response?.data?.message || error?.message || t("failed_to_save_discount");
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = useCallback((discount: Discount) => {
    // Extract ID correctly from the discount object
    const discountId = extractId(discount);
    
    if (!discountId) {
      console.error("Discount ID not found", discount);
      toast.error(t("discount_id_not_found"));
      return;
    }
    
    // Create a clean discount object with proper ID
    const discountToEdit: Discount = {
      ...discount,
      _id: discountId,
      id: discountId,
    };
    
    console.log("Editing discount:", discountToEdit);
    setEditingDiscount(discountToEdit);
    setIsModalOpen(true);
  }, [extractId, t]);

  const handleDelete = useCallback((id: string) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (deleteId) {
      try {
        await deleteDiscount(deleteId);
        toast.success(t("discount_deleted_successfully"));
        setDeleteId(null);
        setSelectedIds(prev => prev.filter(sid => sid !== deleteId));
        await fetchDiscounts();
      } catch (error) {
        toast.error(t("failed_to_delete_discount"));
      }
    }
  }, [deleteId, deleteDiscount, fetchDiscounts, t]);

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      await Promise.all(selectedIds.map(id => deleteDiscount(id)));
      toast.success(t("discounts_deleted_successfully", { count: selectedIds.length }));
      setSelectedIds([]);
      setIsBulkConfirmOpen(false);
      await fetchDiscounts();
    } catch (error) {
      console.error("Bulk delete failed", error);
      toast.error(t("failed_to_delete_discounts"));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const getAppliesToName = (discount: Discount): string => {
    if (discount.appliesTo === "PRODUCT" && discount.productId) {
      if (typeof discount.productId === "object") {
        return (discount.productId as any)?.productName || discount.productId;
      }
      return discount.productId;
    }
    if (discount.appliesTo === "CUSTOMER" && discount.customerId) {
      if (typeof discount.customerId === "object") {
        return (discount.customerId as any)?.customerName || discount.customerId;
      }
      return discount.customerId;
    }
    if (discount.appliesTo === "CATEGORY" && discount.categoryId) {
      return discount.categoryId;
    }
    return t("all");
  };

  const getValueDisplay = (discount: Discount): string => {
    if (discount.type === "PERCENTAGE") {
      return `${discount.value}%`;
    }
    if (discount.type === "FIXED") {
      return `${discount.value?.toLocaleString()} EGP`;
    }
    return discount.value?.toString() || "0";
  };

  // Apply filters
  const filteredDiscounts = useMemo(() => {
    return discounts.filter(d => {
      const matchesSearch = 
        d.discountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getAppliesToName(d).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || d.status === statusFilter;
      const matchesType = !typeFilter || d.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [discounts, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const totalDiscounts = filteredDiscounts.length;
  const activeDiscounts = filteredDiscounts.filter(d => d.status === "ACTIVE").length;
  const percentageDiscounts = filteredDiscounts.filter(d => d.type === "PERCENTAGE").length;
  const fixedAmountDiscounts = filteredDiscounts.filter(d => d.type === "FIXED").length;

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
      ACTIVE: { variant: "success", label: t("active") },
      INACTIVE: { variant: "danger", label: t("inactive") },
      EXPIRED: { variant: "warning", label: t("expired") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: "info" | "success" | "purple"; label: string }> = {
      PERCENTAGE: { variant: "info", label: t("percentage") },
      FIXED_AMOUNT: { variant: "success", label: t("fixed_amount") },
      BUY_X_GET_Y: { variant: "purple", label: t("buy_x_get_y") },
    };
    const config = typeMap[type] || { variant: "info", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
    { value: "EXPIRED", label: t("expired") },
  ];

  const typeOptions = [
    { value: "", label: t("all_types") },
    { value: "PERCENTAGE", label: t("percentage") },
    { value: "FIXED_AMOUNT", label: t("fixed_amount") },
    { value: "BUY_X_GET_Y", label: t("buy_x_get_y") },
  ];

  const columns: Column<Discount>[] = useMemo(
    () => [
      {
        header: t("discount_info"),
        render: (d) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Tag size={18} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{d.discountName}</span>
              <span className="text-xs text-gray-500">{getTypeBadge(d.type)}</span>
            </div>
          </div>
        )
      },
      {
        header: t("value"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            {d.type === "PERCENTAGE" ? (
              <Percent size={14} className="text-green-600" />
            ) : (
              <DollarSign size={14} className="text-green-600" />
            )}
            <span className="text-sm font-bold text-green-600">{getValueDisplay(d)}</span>
          </div>
        )
      },
      {
        header: t("applies_to"),
        render: (d) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {d.appliesTo === "PRODUCT" ? t("product") :
               d.appliesTo === "CATEGORY" ? t("category") :
               d.appliesTo === "CUSTOMER" ? t("customer") :
               d.appliesTo === "CUSTOMER_GROUP" ? t("customer_group") :
               t("order_total")}
            </span>
            <span className="text-xs text-gray-500">{getAppliesToName(d)}</span>
          </div>
        )
      },
      {
        header: t("validity"),
        render: (d) => (
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">
              {formatDate(d.startDate)} → {formatDate(d.endDate)}
            </span>
          </div>
        )
      },
      {
        header: t("status"),
        render: (d) => getStatusBadge(d.status)
      },
      {
        header: t("actions"),
        className: "text-center",
        render: (d) => {
          const discountId = extractId(d);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEdit(d)}
                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg border border-gray-200 transition-colors"
                title={t("edit")}
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => handleDelete(discountId)}
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
            {t("discounts")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("manage_your_discounts")}
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
          <ExportDropdown data={filteredDiscounts} filename="discounts" />
          <Button
            variant="primary"
            onClick={() => {
              setEditingDiscount(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus size={18} />
            {t("add_discount")}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_discounts")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalDiscounts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Percent size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("percentage")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{percentageDiscounts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("fixed_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{fixedAmountDiscounts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-xs text-gray-500">{t("active")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{activeDiscounts}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_discounts")}
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
        data={filteredDiscounts}
        columns={columns}
        keyExtractor={(item) => extractId(item)}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* Modal */}
      <DiscountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDiscount(null);
        }}
        onSave={handleSave}
        discountToEdit={editingDiscount}
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title={t("delete_discount")}
        message={t("are_you_sure_delete_discount")}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmationModal
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title={t("delete_discounts")}
        message={t("are_you_sure_delete_discounts", { count: selectedIds.length })}
      />
    </div>
  );
};