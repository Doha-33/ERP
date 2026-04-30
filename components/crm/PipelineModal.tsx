import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Layers, DollarSign, TrendingUp, Target } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { CRMPipeline } from "../../types";

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMPipeline>) => Promise<void>;
  pipelineToEdit?: CRMPipeline | null;
  isLoading?: boolean;
}

export const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  pipelineToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pipelineName: "",
    totalDealValue: 0,
    numberOfDeals: 0,
    stage: "In Pipeline",
  });

  useEffect(() => {
    if (pipelineToEdit && isOpen) {
      setFormData({
        pipelineName: pipelineToEdit.pipelineName || "",
        totalDealValue: pipelineToEdit.totalDealValue || 0,
        numberOfDeals: pipelineToEdit.numberOfDeals || 0,
        stage: pipelineToEdit.stage || "In Pipeline",
      });
    } else if (!pipelineToEdit && isOpen) {
      setFormData({
        pipelineName: "",
        totalDealValue: 0,
        numberOfDeals: 0,
        stage: "In Pipeline",
      });
    }
  }, [pipelineToEdit, isOpen]);

  const stageOptions = [
    { value: "In Pipeline", label: t("in_pipeline") },
    { value: "Win", label: t("win") },
    { value: "Lost", label: t("lost") },
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {pipelineToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {pipelineToEdit ? t("edit_pipeline") : t("add_pipeline")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Pipeline Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("pipeline_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.pipelineName}
              onChange={(e) => handleChange("pipelineName", e.target.value)}
              placeholder={t("enter_pipeline_name")}
              required
              fullWidth
            />
          </div>

          {/* Stage */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("stage")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.stage}
              onChange={(e) => handleChange("stage", e.target.value)}
              options={stageOptions}
              required
              fullWidth
            />
          </div>

          {/* Total Deal Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("total_deal_value")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.totalDealValue}
              onChange={(e) => handleChange("totalDealValue", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Number of Deals */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("number_of_deals")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.numberOfDeals}
              onChange={(e) => handleChange("numberOfDeals", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>
        </div>

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
            {pipelineToEdit ? t("save") : t("add_pipeline")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};