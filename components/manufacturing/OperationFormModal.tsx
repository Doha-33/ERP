import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Wrench, Clock, DollarSign, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input } from "../../components/ui/Common";
import { Operation as OpType } from "../../types";

interface OperationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOperation: OpType | null;
  onSave: (data: Partial<OpType>) => Promise<void>;
  loading: boolean;
}

export const OperationFormModal: React.FC<OperationFormModalProps> = ({
  isOpen,
  onClose,
  selectedOperation,
  onSave,
  loading,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<OpType>>({});

  useEffect(() => {
    if (selectedOperation) {
      setFormData(selectedOperation);
    } else {
      setFormData({});
    }
  }, [selectedOperation, isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      onClose();
      setFormData({});
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof OpType, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedOperation ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedOperation ? t("edit_operation") : t("add_operation")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Operation ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("operation_id")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.operation_id || ""}
              onChange={(e) => handleChange("operation_id", e.target.value)}
              placeholder="OP-001"
              required
              fullWidth
            />
          </div>

          {/* Operation Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("operation_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.operation_name || ""}
              onChange={(e) => handleChange("operation_name", e.target.value)}
              placeholder={t("enter_operation_name")}
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
              value={formData.work_center || ""}
              onChange={(e) => handleChange("work_center", e.target.value)}
              placeholder={t("enter_work_center")}
              required
              fullWidth
            />
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("duration")} ({t("min")}) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.duration || ""}
              onChange={(e) => handleChange("duration", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Sequence */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("sequence")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.sequence || ""}
              onChange={(e) => handleChange("sequence", Number(e.target.value))}
              placeholder="1"
              required
              fullWidth
            />
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("cost")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.cost || ""}
              onChange={(e) => handleChange("cost", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>
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
            {selectedOperation ? t("save") : t("add_operation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};