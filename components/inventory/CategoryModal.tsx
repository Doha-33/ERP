import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Tag, FileText, DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Category, Account } from "../../types";
import { toast } from "sonner";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Category>) => Promise<void>;
  categoryToEdit?: Category | null;
  accounts?: Account[]; // List of accounts for selection
  isLoading?: boolean;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryToEdit,
  accounts = [],
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
    incomeAccountId: "",
    expenseAccountId: "",
    inventoryValuationAccountId: "",
    costOfGoodsSoldAccountId: "",
  });

  // Helper to extract ID from account object or string
  const extractAccountId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "object") {
      return value._id || value.id || "";
    }
    return value;
  }, []);

  useEffect(() => {
    if (categoryToEdit && isOpen) {
      setFormData({
        name: categoryToEdit.name || "",
        description: categoryToEdit.description || "",
        status: categoryToEdit.status || "ACTIVE",
        incomeAccountId: extractAccountId(categoryToEdit.incomeAccountId),
        expenseAccountId: extractAccountId(categoryToEdit.expenseAccountId),
        inventoryValuationAccountId: extractAccountId(categoryToEdit.inventoryValuationAccountId),
        costOfGoodsSoldAccountId: extractAccountId(categoryToEdit.costOfGoodsSoldAccountId),
      });
    } else if (!categoryToEdit && isOpen) {
      setFormData({
        name: "",
        description: "",
        status: "ACTIVE",
        incomeAccountId: "",
        expenseAccountId: "",
        inventoryValuationAccountId: "",
        costOfGoodsSoldAccountId: "",
      });
    }
  }, [categoryToEdit, isOpen, extractAccountId]);

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  // Filter accounts by type
  const revenueAccounts = accounts.filter(acc => acc.accountType === "REVENUE");
  const expenseAccounts = accounts.filter(acc => acc.accountType === "EXPENSE");
  const assetAccounts = accounts.filter(acc => acc.accountType === "ASSET");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t("category_name_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: Partial<Category> = {
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
      };
      
      // Only include account IDs if they are selected
      if (formData.incomeAccountId) saveData.incomeAccountId = formData.incomeAccountId;
      if (formData.expenseAccountId) saveData.expenseAccountId = formData.expenseAccountId;
      if (formData.inventoryValuationAccountId) saveData.inventoryValuationAccountId = formData.inventoryValuationAccountId;
      if (formData.costOfGoodsSoldAccountId) saveData.costOfGoodsSoldAccountId = formData.costOfGoodsSoldAccountId;
      
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format account option label
  const getAccountLabel = (account: Account) => {
    return `${account.accountCode} - ${account.accountName}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {categoryToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {categoryToEdit ? t("edit_category") : t("add_category")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Category Name */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("category_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_category_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("enter_description")}
                rows={3}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Income Account (Revenue) */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <TrendingUp size={14} className="inline mr-1 text-green-600" />
              {t("income_account")}
            </label>
            <Select
              value={formData.incomeAccountId}
              onChange={(e) => handleChange("incomeAccountId", e.target.value)}
              options={[
                { value: "", label: t("select_income_account") },
                ...revenueAccounts.map(acc => ({
                  value: acc._id,
                  label: getAccountLabel(acc)
                }))
              ]}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">{t("income_account_helper")}</p>
          </div>

          {/* Expense Account */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <TrendingDown size={14} className="inline mr-1 text-red-600" />
              {t("expense_account")}
            </label>
            <Select
              value={formData.expenseAccountId}
              onChange={(e) => handleChange("expenseAccountId", e.target.value)}
              options={[
                { value: "", label: t("select_expense_account") },
                ...expenseAccounts.map(acc => ({
                  value: acc._id,
                  label: getAccountLabel(acc)
                }))
              ]}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">{t("expense_account_helper")}</p>
          </div>

          {/* Inventory Valuation Account (Asset) */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <Package size={14} className="inline mr-1 text-blue-600" />
              {t("inventory_valuation_account")}
            </label>
            <Select
              value={formData.inventoryValuationAccountId}
              onChange={(e) => handleChange("inventoryValuationAccountId", e.target.value)}
              options={[
                { value: "", label: t("select_inventory_account") },
                ...assetAccounts.map(acc => ({
                  value: acc._id,
                  label: getAccountLabel(acc)
                }))
              ]}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">{t("inventory_account_helper")}</p>
          </div>

          {/* Cost of Goods Sold Account (Expense) */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              <DollarSign size={14} className="inline mr-1 text-orange-600" />
              {t("cost_of_goods_sold_account")}
            </label>
            <Select
              value={formData.costOfGoodsSoldAccountId}
              onChange={(e) => handleChange("costOfGoodsSoldAccountId", e.target.value)}
              options={[
                { value: "", label: t("select_cogs_account") },
                ...expenseAccounts.map(acc => ({
                  value: acc._id,
                  label: getAccountLabel(acc)
                }))
              ]}
              fullWidth
            />
            <p className="text-xs text-gray-500 mt-1">{t("cogs_account_helper")}</p>
          </div>

          {/* Status */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={isSubmitting || isLoading}
            type="button"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {categoryToEdit ? t("update_category") : t("add_category")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};