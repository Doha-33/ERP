import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, DollarSign, Calendar, Building2, TrendingUp, Clock } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, Badge } from "../../components/ui/Common";
import { Budget as BudgetType } from "../../types";
import { toast } from "sonner";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BudgetType>) => Promise<void>;
  budgetToEdit?: BudgetType | null;
  isLoading?: boolean;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  budgetToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    departmentName: "",
    fiscalYear: new Date().getFullYear(),
    allocatedAmount: 0,
    spentAmount: 0,
    status: "OPEN",
    notes: "",
  });

  // Helper function to extract ID (for future use)
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  useEffect(() => {
    if (budgetToEdit && isOpen) {
      setFormData({
        name: budgetToEdit.name || "",
        departmentName: budgetToEdit.departmentName || "",
        fiscalYear: budgetToEdit.fiscalYear || new Date().getFullYear(),
        allocatedAmount: budgetToEdit.allocatedAmount || 0,
        spentAmount: budgetToEdit.spentAmount || 0,
        status: budgetToEdit.status || "OPEN",
        notes: budgetToEdit.notes || "",
      });
    } else if (!budgetToEdit && isOpen) {
      setFormData({
        name: "",
        departmentName: "",
        fiscalYear: new Date().getFullYear(),
        allocatedAmount: 0,
        spentAmount: 0,
        status: "OPEN",
        notes: "",
      });
    }
  }, [budgetToEdit, isOpen]);

  const statusOptions = [
    { value: "OPEN", label: t("open"), color: "green" },
    { value: "CLOSED", label: t("closed"), color: "red" },
    { value: "FROZEN", label: t("frozen"), color: "orange" },
  ];

  const yearOptions = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => ({
    value: y,
    label: String(y),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error(t("budget_name_required"));
      return;
    }
    if (!formData.departmentName.trim()) {
      toast.error(t("department_required"));
      return;
    }
    if (formData.allocatedAmount <= 0) {
      toast.error(t("allocated_amount_positive"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: any = {
        name: formData.name,
        departmentName: formData.departmentName,
        fiscalYear: formData.fiscalYear,
        allocatedAmount: formData.allocatedAmount,
        spentAmount: formData.spentAmount,
        status: formData.status,
        notes: formData.notes || undefined,
      };
      
      // If editing, include the ID
      if (budgetToEdit) {
        const budgetId = extractId(budgetToEdit);
        if (budgetId) {
          saveData._id = budgetId;
          saveData.id = budgetId;
        }
      }
      
      console.log("Saving budget:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_budget"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const variance = formData.allocatedAmount - formData.spentAmount;
  const utilization = formData.allocatedAmount > 0
    ? (formData.spentAmount / formData.allocatedAmount) * 100
    : 0;

  const getUtilizationColor = (util: number) => {
    if (util > 90) return "text-red-600";
    if (util > 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUtilizationBarColor = (util: number) => {
    if (util > 90) return "bg-red-500";
    if (util > 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN": return "success";
      case "CLOSED": return "danger";
      case "FROZEN": return "warning";
      default: return "info";
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return "-";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {budgetToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {budgetToEdit ? t("edit_budget") : t("add_budget")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Budget Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("budget_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={t("enter_budget_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Department Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.departmentName}
                onChange={(e) => handleChange("departmentName", e.target.value)}
                placeholder={t("enter_department")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Fiscal Year */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("fiscal_year")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.fiscalYear}
                onChange={(e) => handleChange("fiscalYear", Number(e.target.value))}
                options={yearOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Allocated Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("allocated_amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.allocatedAmount}
                onChange={(e) => handleChange("allocatedAmount", Number(e.target.value))}
                placeholder="0.00"
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Spent Amount (display only for edit) */}
          {budgetToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("spent_amount")} (EGP)
              </label>
              <div className="relative">
                <TrendingUp size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.spentAmount}
                  onChange={(e) => handleChange("spentAmount", Number(e.target.value))}
                  placeholder="0.00"
                  className="bg-gray-50 pl-10"
                  fullWidth
                />
              </div>
            </div>
          )}

          {/* Status */}
          <div className="space-y-1">
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

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("notes")}
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("enter_notes")}
              rows={3}
              fullWidth
            />
          </div>
        </div>

        {/* Budget Summary Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            {t("budget_summary")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("allocated")}</p>
              <p className="text-lg font-bold text-indigo-600">{formData.allocatedAmount.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("spent")}</p>
              <p className="text-lg font-bold text-orange-600">{formData.spentAmount.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("variance")}</p>
              <p className="text-lg font-bold text-green-600">{variance.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("utilization")}</p>
              <p className={`text-lg font-bold ${getUtilizationColor(utilization)}`}>
                {utilization.toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getUtilizationBarColor(utilization)}`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-gray-400">
              <span>0%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Metadata (created/updated dates for edit mode) */}
          {budgetToEdit && (
            <div className="mt-4 pt-3 border-t border-indigo-200 flex justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{t("created")}: {formatDateTime((budgetToEdit as any).createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{t("updated")}: {formatDateTime((budgetToEdit as any).updatedAt)}</span>
              </div>
            </div>
          )}
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
            {budgetToEdit ? t("update_budget") : t("add_budget")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};