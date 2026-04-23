// src/components/assets/TrackingFormModal.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, MapPin, History, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Tracking as TrackingType, Asset } from "../../types";

interface TrackingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTracking: TrackingType | null;
  assets: Asset[];
  onSave: (data: Partial<TrackingType>) => Promise<void>;
}

export const TrackingFormModal: React.FC<TrackingFormModalProps> = ({
  isOpen,
  onClose,
  selectedTracking,
  assets,
  onSave,
}) => {
  const { t } = useTranslation();

  // Asset options for dropdown
  const assetOptions = assets.map(asset => ({
    value: asset._id || asset.id!,
    label: `${asset.assetName} - ${asset.serialNumber || asset.assetCode || ''}`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<TrackingType> = {
      assetId: data.assetId as string,
      currentLocation: data.currentLocation as string,
      movementHistory: data.movementHistory as string,
      notes: data.notes as string,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedTracking ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedTracking ? t("edit_tracking") : t("add_tracking")}
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
                typeof selectedTracking?.assetId === "object"
                  ? (selectedTracking.assetId as any)._id
                  : selectedTracking?.assetId || ""
              }
              options={assetOptions}
              placeholder={t("select_asset")}
              required
              fullWidth
            />
          </div>

          {/* Current Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("current_location")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="currentLocation"
              defaultValue={selectedTracking?.currentLocation}
              placeholder={t("enter_current_location")}
              required
              fullWidth
            />
          </div>

          {/* Movement History */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("movement_history")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="movementHistory"
              defaultValue={selectedTracking?.movementHistory}
              placeholder={t("enter_movement_history")}
              className="min-h-[100px]"
              required
              fullWidth
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("notes")}
            </label>
            <TextArea
              name="notes"
              defaultValue={selectedTracking?.notes}
              placeholder={t("enter_notes_optional")}
              className="min-h-[80px]"
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
            {selectedTracking ? t("save") : t("add_tracking")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};