import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Wrench } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { MaintenanceRecord, Vehicle } from "../../types";

interface MaintenanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: MaintenanceRecord | null;
  vehicles: Vehicle[];
  onSave: (data: Partial<MaintenanceRecord>) => Promise<void>;
}

export const MaintenanceFormModal: React.FC<MaintenanceFormModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
  vehicles,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const maintenanceTypes = [
    { value: "Oil Change", label: "Oil Change" },
    { value: "Tire Replacement", label: "Tire Replacement" },
    { value: "Brake Service", label: "Brake Service" },
    { value: "Engine Service", label: "Engine Service" },
    { value: "Transmission Service", label: "Transmission Service" },
    { value: "Electrical System", label: "Electrical System" },
    { value: "Cooling System", label: "Cooling System" },
    { value: "Regular Inspection", label: "Regular Inspection" },
  ];

  const statusOptions = [
    { value: "Scheduled", label: t("scheduled") },
    { value: "Pending", label: t("pending") },
    { value: "Completed", label: t("completed") },
    { value: "Canceled", label: t("cancelled") },
  ];

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.plateNumber} - ${vehicle.model} (${vehicle.vehicleCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const processedData: Partial<MaintenanceRecord> = {
      vehicleId: formData.get('vehicleId') as string,
      type: formData.get('type') as string,
      date: formData.get('date') as string,
      cost: Number(formData.get('cost')),
      odometer: Number(formData.get('odometer')),
      provider: formData.get('provider') as string,
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
          {selectedRecord ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedRecord ? t("edit_maintenance_record") : t("add_maintenance_record")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Vehicle */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("vehicle")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="vehicleId"
              defaultValue={
                typeof selectedRecord?.vehicleId === "object"
                  ? (selectedRecord.vehicleId as any)._id
                  : selectedRecord?.vehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_maintenance_vehicle")}
              required
              fullWidth
            />
          </div>

          {/* Maintenance Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("maintenance_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="type"
              defaultValue={selectedRecord?.type || ""}
              options={maintenanceTypes}
              placeholder={t("enter_maintenance_type")}
              required
              fullWidth
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="date"
              type="date"
              defaultValue={
                selectedRecord?.date
                  ? new Date(selectedRecord.date).toISOString().split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("cost")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              name="cost"
              type="number"
              step="0.01"
              defaultValue={selectedRecord?.cost || 0}
              placeholder={t("enter_cost")}
              required
              fullWidth
            />
          </div>

          {/* Odometer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("odometer")} (km) <span className="text-red-500">*</span>
            </label>
            <Input
              name="odometer"
              type="number"
              defaultValue={selectedRecord?.odometer || 0}
              placeholder={t("enter_odometer")}
              required
              fullWidth
            />
          </div>

          {/* Provider */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("provider")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="provider"
              defaultValue={selectedRecord?.provider || ""}
              placeholder={t("enter_provider")}
              required
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
              defaultValue={selectedRecord?.status || ""}
              options={statusOptions}
              placeholder={t("select_maintenance_status")}
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
            {selectedRecord ? t("save") : t("add_maintenance_record")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};