import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Building2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CostCenter } from "../../types";

interface CostCenterFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCostCenter: CostCenter | null;
  onSave: (data: Partial<CostCenter>) => Promise<void>;
}

export const CostCenterFormModal: React.FC<CostCenterFormModalProps> = ({
  isOpen,
  onClose,
  selectedCostCenter,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "Inactive", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const processedData: Partial<CostCenter> = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as string,
    };

    try {
      await onSave(processedData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedCostCenter ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedCostCenter ? t("edit_cost_center") : t("add_cost_center")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-8 gap-y-4">
          {/* Cost Center Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("cost_center_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              defaultValue={selectedCostCenter?.name || ""}
              placeholder={t("enter_cost_center_name")}
              required
              fullWidth
            />
          </div>

          {/* Cost Center Code */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("cost_center_code")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="code"
              defaultValue={selectedCostCenter?.code || ""}
              placeholder={t("enter_cost_center_code")}
              required
              fullWidth
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("description")}
            </label>
            <TextArea
              name="description"
              defaultValue={selectedCostCenter?.description || ""}
              placeholder={t("enter_description")}
              rows={4}
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="status"
              defaultValue={selectedCostCenter?.status || "Active"}
              options={statusOptions}
              placeholder={t("select_cost_center_status")}
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {selectedCostCenter ? t("save") : t("add_cost_center")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};