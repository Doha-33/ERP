import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, DollarSign, Calendar, Building2, TrendingUp } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Budget as BudgetType } from "../../types";

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
    { value: "OPEN", label: t("open") },
    { value: "CLOSED", label: t("closed") },
    { value: "FROZEN", label: t("frozen") },
  ];

  const yearOptions = [2023, 2024, 2025, 2026, 2027, 2028].map(y => ({
    value: y,
    label: String(y),
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Budget Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("budget_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_budget_name")}
              required
              fullWidth
            />
          </div>

          {/* Department Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.departmentName}
              onChange={(e) => handleChange("departmentName", e.target.value)}
              placeholder={t("enter_department")}
              required
              fullWidth
            />
          </div>

          {/* Fiscal Year */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("fiscal_year")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.fiscalYear}
              onChange={(e) => handleChange("fiscalYear", Number(e.target.value))}
              options={yearOptions}
              required
              fullWidth
            />
          </div>

          {/* Allocated Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("allocated_amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.allocatedAmount}
              onChange={(e) => handleChange("allocatedAmount", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Spent Amount (only for edit) */}
          {budgetToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("spent_amount")} (EGP)
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.spentAmount}
                onChange={(e) => handleChange("spentAmount", Number(e.target.value))}
                placeholder="0.00"
                disabled
                className="bg-gray-50"
                fullWidth
              />
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
        {budgetToEdit && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600" />
              {t("budget_summary")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("allocated")}</p>
                <p className="text-sm font-bold text-indigo-600">{formData.allocatedAmount.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("spent")}</p>
                <p className="text-sm font-medium text-orange-600">{formData.spentAmount.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("variance")}</p>
                <p className="text-sm font-bold text-green-600">{variance.toLocaleString()} EGP</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("utilization")}</p>
                <p className="text-sm font-bold text-purple-600">{utilization.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {budgetToEdit ? t("save") : t("add_budget")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};