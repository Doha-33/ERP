import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Ruler, Hash, ArrowRight, ToggleLeft } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Unit } from "../../types";
import { useData } from "../../context/DataContext";

interface UnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => Promise<void>;
  unitToEdit?: Unit | null;
  isLoading?: boolean;
}

export const UnitModal: React.FC<UnitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  unitToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { units } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    abbreviation: "",
    parentUnitId: "",
    conversionFactor: 1,
    status: "ACTIVE",
  });

  useEffect(() => {
    if (unitToEdit && isOpen) {
      setFormData({
        name: unitToEdit.name || "",
        abbreviation: unitToEdit.abbreviation || "",
        parentUnitId: unitToEdit.parentUnitId || "",
        conversionFactor: unitToEdit.conversionFactor || 1,
        status: unitToEdit.status || unitToEdit.state || "ACTIVE",
      });
    } else if (!unitToEdit && isOpen) {
      setFormData({
        name: "",
        abbreviation: "",
        parentUnitId: "",
        conversionFactor: 1,
        status: "ACTIVE",
      });
    }
  }, [unitToEdit, isOpen]);

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  // Parent unit options (excluding the current unit when editing)
  const parentUnitOptions = [
    { value: "", label: t("none") },
    ...units
      .filter(u => !unitToEdit || u._id !== unitToEdit._id)
      .map(u => ({
        value: u._id || u.id,
        label: `${u.name} (${u.abbreviation})`,
      })),
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        parentUnitId: formData.parentUnitId || null,
      });
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {unitToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {unitToEdit ? t("edit_unit") : t("add_unit")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Unit Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("unit_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("enter_unit_name")}
              required
              fullWidth
            />
          </div>

          {/* Abbreviation */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("abbreviation")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.abbreviation}
              onChange={(e) => handleChange("abbreviation", e.target.value)}
              placeholder="kg, pcs, m..."
              required
              fullWidth
            />
          </div>

          {/* Parent Unit */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("parent_unit")}
            </label>
            <Select
              value={formData.parentUnitId}
              onChange={(e) => handleChange("parentUnitId", e.target.value)}
              options={parentUnitOptions}
              placeholder={t("select_parent_unit")}
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("parent_unit_description")}</p>
          </div>

          {/* Conversion Factor */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("conversion_factor")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.conversionFactor}
              onChange={(e) => handleChange("conversionFactor", Number(e.target.value))}
              placeholder="1"
              required
              fullWidth
            />
            <p className="text-xs text-gray-500">{t("conversion_factor_description")}</p>
          </div>

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
        </div>

        {/* Preview Information */}
        {formData.parentUnitId && formData.conversionFactor !== 1 && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-gray-700 flex items-center gap-2">
              <Ruler size={16} className="text-blue-600" />
              <span className="font-medium">{t("conversion_preview")}:</span>
              <span>1 {formData.abbreviation || "unit"} = {formData.conversionFactor} × (base unit)</span>
            </p>
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
            {unitToEdit ? t("save") : t("add_unit")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};