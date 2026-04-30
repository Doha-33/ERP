import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, AlertTriangle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Accident, Vehicle, Driver } from "../../types";

interface AccidentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAccident: Accident | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSave: (data: Partial<Accident>) => Promise<void>;
}

export const AccidentFormModal: React.FC<AccidentFormModalProps> = ({
  isOpen,
  onClose,
  selectedAccident,
  vehicles,
  drivers,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const damageLevelOptions = [
    { value: "Low", label: t("low") },
    { value: "Medium", label: t("medium") },
    { value: "High", label: t("high") },
  ];

  const statusOptions = [
    { value: "Open", label: t("open") },
    { value: "Under Review", label: t("under_review") },
    { value: "Closed", label: t("closed") },
  ];

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.plateNumber} - ${vehicle.model} (${vehicle.vehicleCode})`,
  }));

  const driverOptions = drivers.map(driver => ({
    value: driver._id,
    label: `${driver.driverName} (${driver.driverCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const processedData: Partial<Accident> = {
      vehicleId: formData.get('vehicleId') as string,
      driverId: formData.get('driverId') as string,
      date: formData.get('date') as string,
      location: formData.get('location') as string,
      damageLevel: formData.get('damageLevel') as string,
      actualCost: Number(formData.get('actualCost')),
      insuranceProvider: formData.get('insuranceProvider') as string,
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
          {selectedAccident ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedAccident ? t("edit_accident") : t("add_accident")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-8 gap-y-4">
          {/* Vehicle */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("vehicle")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="vehicleId"
              defaultValue={
                typeof selectedAccident?.vehicleId === "object"
                  ? (selectedAccident.vehicleId as any)._id
                  : selectedAccident?.vehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_vehicle")}
              required
              fullWidth
            />
          </div>

          {/* Driver */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("driver")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="driverId"
              defaultValue={
                typeof selectedAccident?.driverId === "object"
                  ? (selectedAccident.driverId as any)._id
                  : selectedAccident?.driverId || ""
              }
              options={driverOptions}
              placeholder={t("select_driver")}
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
                selectedAccident?.date
                  ? new Date(selectedAccident.date).toISOString().split("T")[0]
                  : ""
              }
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
              defaultValue={selectedAccident?.location || ""}
              placeholder={t("enter_location")}
              required
              fullWidth
            />
          </div>

          {/* Damage Level */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("damage_level")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="damageLevel"
              defaultValue={selectedAccident?.damageLevel || ""}
              options={damageLevelOptions}
              placeholder={t("select_damage_level")}
              required
              fullWidth
            />
          </div>

          {/* Actual Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("actual_cost")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="actualCost"
              type="number"
              step="0.01"
              defaultValue={selectedAccident?.actualCost || 0}
              placeholder={t("enter_actual_cost")}
              required
              fullWidth
            />
          </div>

          {/* Insurance Provider */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("insurance_provider")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="insuranceProvider"
              defaultValue={selectedAccident?.insuranceProvider || ""}
              placeholder={t("enter_insurance_provider")}
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
              defaultValue={selectedAccident?.status || ""}
              options={statusOptions}
              placeholder={t("select_accident_status")}
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
            {selectedAccident ? t("save") : t("add_accident")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};