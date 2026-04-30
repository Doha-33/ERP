import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Fuel } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { FuelLog, Vehicle, Driver } from "../../types";

interface FuelLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLog: FuelLog | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSave: (data: Partial<FuelLog>) => Promise<void>;
}

export const FuelLogFormModal: React.FC<FuelLogFormModalProps> = ({
  isOpen,
  onClose,
  selectedLog,
  vehicles,
  drivers,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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
    
    const processedData: Partial<FuelLog> = {
      vehicleId: formData.get('vehicleId') as string,
      driverId: formData.get('driverId') as string,
      date: formData.get('date') as string,
      quantity: Number(formData.get('quantity')),
      cost: Number(formData.get('cost')),
      odometer: Number(formData.get('odometer')),
      station: formData.get('station') as string,
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
          {selectedLog ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedLog ? t("edit_fuel_log") : t("add_fuel_log")}
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
                typeof selectedLog?.vehicleId === "object"
                  ? (selectedLog.vehicleId as any)._id
                  : selectedLog?.vehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_fuel_vehicle")}
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
                typeof selectedLog?.driverId === "object"
                  ? (selectedLog.driverId as any)._id
                  : selectedLog?.driverId || ""
              }
              options={driverOptions}
              placeholder={t("select_fuel_driver")}
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
                selectedLog?.date
                  ? new Date(selectedLog.date).toISOString().split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Station */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("station")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="station"
              defaultValue={selectedLog?.station || ""}
              placeholder={t("enter_station")}
              required
              fullWidth
            />
          </div>

          {/* Quantity */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("quantity")} (L) <span className="text-red-500">*</span>
            </label>
            <Input
              name="quantity"
              type="number"
              step="0.01"
              defaultValue={selectedLog?.quantity || 0}
              placeholder={t("enter_quantity")}
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
              defaultValue={selectedLog?.cost || 0}
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
              defaultValue={selectedLog?.odometer || 0}
              placeholder={t("enter_odometer")}
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
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {selectedLog ? t("save") : t("add_fuel_log")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};