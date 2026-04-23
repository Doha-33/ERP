// src/components/assets/DepreciationFormModal.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Calculator } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, FileUpload } from "../../components/ui/Common";
import { Depreciation as DepreciationType, Asset } from "../../types";
import { toast } from "sonner";

interface DepreciationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDepreciation: DepreciationType | null;
  assets: Asset[];
  onSave: (data: Partial<DepreciationType>) => Promise<void>;
}

export const DepreciationFormModal: React.FC<DepreciationFormModalProps> = ({
  isOpen,
  onClose,
  selectedDepreciation,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();

  // Depreciation Method Options - حسب الـ API
  const depreciationMethodOptions = [
    { value: "Straight Line", label: t("straight_line") },
    { value: "Declining Balance", label: t("declining_balance") },
    { value: "Units of Production", label: t("units_of_production") },
  ];

  // Accounting Period Options - حسب الـ API
  const accountingPeriodOptions = [
    { value: "Month", label: t("month") },
    { value: "Quarter", label: t("quarter") },
    { value: "Year", label: t("year") },
  ];

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<DepreciationType> = {
      assetId: data.assetId as string,
      purchaseCost: Number(data.purchaseCost),
      usefulLife: data.usefulLife as string,
      depreciationMethod: data.depreciationMethod as string,
      accumulatedDepreciation: Number(data.accumulatedDepreciation),
      currentValue: Number(data.currentValue),
      accountingPeriod: data.accountingPeriod as string,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedDepreciation ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedDepreciation ? t("edit_depreciation") : t("add_depreciation")}
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
                typeof selectedDepreciation?.assetId === "object"
                  ? (selectedDepreciation.assetId as any)._id
                  : selectedDepreciation?.assetId || ""
              }
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Purchase Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("purchase_cost")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="purchaseCost"
              type="number"
              defaultValue={selectedDepreciation?.purchaseCost}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Useful Life */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("useful_life")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="usefulLife"
              defaultValue={selectedDepreciation?.usefulLife}
              placeholder={t("e.g. 5 Years")}
              required
              fullWidth
            />
          </div>

          {/* Depreciation Method Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("depreciation_method")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="depreciationMethod"
              defaultValue={selectedDepreciation?.depreciationMethod || ""}
              options={depreciationMethodOptions}
              required
              fullWidth
            />
          </div>

          {/* Accumulated Depreciation */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("accumulated_depreciation")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="accumulatedDepreciation"
              type="number"
              defaultValue={selectedDepreciation?.accumulatedDepreciation}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Current Value */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("current_value")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="currentValue"
              type="number"
              defaultValue={selectedDepreciation?.currentValue}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Accounting Period Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("accounting_period")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="accountingPeriod"
              defaultValue={selectedDepreciation?.accountingPeriod || ""}
              options={accountingPeriodOptions}
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
            {selectedDepreciation ? t("save") : t("add_depreciation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};