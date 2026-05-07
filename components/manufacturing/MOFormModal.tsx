import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Package, Calendar, User, Hash, ClipboardList, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { ManufacturingOrder as MOType } from "../../types";

interface MOFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: MOType | null;
  onSave: (data: Partial<MOType>) => Promise<void>;
  loading: boolean;
}

export const MOFormModal: React.FC<MOFormModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mo_number: "",
    product_code: "",
    product_name: "",
    planned_quantity: 0,
    produced_quantity: 0,
    bom_used: "",
    start_date: "",
    end_date: "",
    responsible: "",
    state: "Draft",
    work_center: "",
    raw_material_availability: "Available",
    cost_summary: 0,
    notes: "",
  });

  useEffect(() => {
    if (selectedOrder && isOpen) {
      setFormData({
        mo_number: selectedOrder.mo_number || "",
        product_code: selectedOrder.product_code || "",
        product_name: selectedOrder.product_name || "",
        planned_quantity: selectedOrder.planned_quantity || 0,
        produced_quantity: selectedOrder.produced_quantity || 0,
        bom_used: selectedOrder.bom_used || "",
        start_date: selectedOrder.start_date
          ? new Date(selectedOrder.start_date).toISOString().split("T")[0]
          : "",
        end_date: selectedOrder.end_date
          ? new Date(selectedOrder.end_date).toISOString().split("T")[0]
          : "",
        responsible: selectedOrder.responsible || "",
        state: selectedOrder.state || "Draft",
        work_center: (selectedOrder as any).work_center || "",
        raw_material_availability: (selectedOrder as any).raw_material_availability || "Available",
        cost_summary: (selectedOrder as any).cost_summary || 0,
        notes: (selectedOrder as any).notes || "",
      });
    } else if (!selectedOrder && isOpen) {
      setFormData({
        mo_number: "",
        product_code: "",
        product_name: "",
        planned_quantity: 0,
        produced_quantity: 0,
        bom_used: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
        responsible: "",
        state: "Draft",
        work_center: "",
        raw_material_availability: "Available",
        cost_summary: 0,
        notes: "",
      });
    }
  }, [selectedOrder, isOpen]);

  const statusOptions = [
    { value: "Draft", label: t("draft") },
    { value: "In Progress", label: t("in_progress") },
    { value: "Done", label: t("done") },
    { value: "Cancelled", label: t("cancelled") },
  ];

  const rawMaterialOptions = [
    { value: "Available", label: t("available") },
    { value: "Partially Available", label: t("partially_available") },
    { value: "Not Available", label: t("not_available") },
  ];

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

  const progress = formData.planned_quantity > 0
    ? Math.round((formData.produced_quantity / formData.planned_quantity) * 100)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedOrder ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedOrder ? t("edit_mo") : t("create_mo")}
        </div>
      }
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* MO Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("mo_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.mo_number}
              onChange={(e) => handleChange("mo_number", e.target.value)}
              placeholder="MO-001"
              required
              fullWidth
            />
          </div>

          {/* BOM Used */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bom_used")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.bom_used}
              onChange={(e) => handleChange("bom_used", e.target.value)}
              placeholder="BOM-001"
              required
              fullWidth
            />
          </div>

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.product_name}
              onChange={(e) => handleChange("product_name", e.target.value)}
              placeholder={t("enter_product_name")}
              required
              fullWidth
            />
          </div>

          {/* Product Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("product_code")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.product_code}
              onChange={(e) => handleChange("product_code", e.target.value)}
              placeholder="PRD-001"
              required
              fullWidth
            />
          </div>

          {/* Planned Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("planned_quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.planned_quantity}
              onChange={(e) => handleChange("planned_quantity", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Produced Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("produced_quantity")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              value={formData.produced_quantity}
              onChange={(e) => handleChange("produced_quantity", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Responsible */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("responsible")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.responsible}
              onChange={(e) => handleChange("responsible", e.target.value)}
              placeholder={t("enter_responsible_name")}
              required
              fullWidth
            />
          </div>

          {/* Work Center */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("work_center")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.work_center}
              onChange={(e) => handleChange("work_center", e.target.value)}
              placeholder={t("enter_work_center")}
              required
              fullWidth
            />
          </div>

          {/* Raw Material Availability */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("raw_material_availability")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.raw_material_availability}
              onChange={(e) => handleChange("raw_material_availability", e.target.value)}
              options={rawMaterialOptions}
              required
              fullWidth
            />
          </div>

          {/* Cost Summary */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("cost_summary")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost_summary}
              onChange={(e) => handleChange("cost_summary", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Progress Preview */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{t("production_progress")}</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{t("produced")}: {formData.produced_quantity}</span>
            <span>{t("planned")}: {formData.planned_quantity}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
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

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || loading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || loading}
            disabled={isSubmitting || loading}
          >
            {selectedOrder ? t("save") : t("create_mo")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};