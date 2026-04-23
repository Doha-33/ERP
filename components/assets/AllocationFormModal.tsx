// src/components/assets/AllocationFormModal.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Allocation as AllocationType, Asset } from "../../types";

interface AllocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllocation: AllocationType | null;
  assets: Asset[];
  onSave: (data: Partial<AllocationType>) => Promise<void>;
}

export const AllocationFormModal: React.FC<AllocationFormModalProps> = ({
  isOpen,
  onClose,
  selectedAllocation,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  // Usage Purpose Options - حسب الـ API
  const usagePurposeOptions = [
    { value: "Work", label: t("work") },
    { value: "Production", label: t("production") },
    { value: "Maintenance", label: t("maintenance") },
    { value: "Management", label: t("management") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<AllocationType> = {
      assetId: data.assetId as string,
      assignedTo: data.assignedTo as string,
      location: data.location as string,
      usagePurpose: data.usagePurpose as string,
      startDate: data.startDate as string,
      endDate: data.endDate as string,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedAllocation ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedAllocation ? t("edit_allocation") : t("add_allocation")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Asset Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("asset")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="assetId"
              defaultValue={
                typeof selectedAllocation?.assetId === "object"
                  ? (selectedAllocation.assetId as any)._id
                  : selectedAllocation?.assetId || ""
              }
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Assigned To */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("assigned_to")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="assignedTo"
              defaultValue={selectedAllocation?.assignedTo}
              placeholder={t("enter_employee_or_department")}
              required
              fullWidth
            />
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("location")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              defaultValue={selectedAllocation?.location}
              placeholder={t("enter_location")}
              required
              fullWidth
            />
          </div>

          {/* Usage Purpose Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("usage_purpose")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="usagePurpose"
              defaultValue={selectedAllocation?.usagePurpose || ""}
              options={usagePurposeOptions}
              placeholder={t("select_usage_purpose")}
              required
              fullWidth
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="startDate"
              type="date"
              defaultValue={
                selectedAllocation?.startDate
                  ? new Date(selectedAllocation.startDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="endDate"
              type="date"
              defaultValue={
                selectedAllocation?.endDate
                  ? new Date(selectedAllocation.endDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {selectedAllocation ? t("save") : t("add_allocation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};