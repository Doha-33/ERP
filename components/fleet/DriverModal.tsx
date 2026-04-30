import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, User } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Driver, Vehicle } from "../../types";

interface DriverFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDriver: Driver | null;
  vehicles: Vehicle[];
  onSave: (data: Partial<Driver>) => Promise<void>;
}

export const DriverFormModal: React.FC<DriverFormModalProps> = ({
  isOpen,
  onClose,
  selectedDriver,
  vehicles,
  onSave,
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "On Trip", label: t("on_trip") },
    { value: "Inactive", label: t("inactive") },
  ];

  const vehicleOptions = [
    { value: "", label: t("none") },
    ...vehicles.map(vehicle => ({
      value: vehicle._id,
      label: `${vehicle.plateNumber} - ${vehicle.model} (${vehicle.vehicleCode})`,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<Driver> = {
      driverName: data.driverName as string,
      licenseNumber: data.licenseNumber as string,
      licenseExpiry: data.licenseExpiry as string,
      phone: data.phone as string,
      assignedVehicleId: data.assignedVehicleId as string,
      status: data.status as string,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedDriver ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedDriver ? t("edit_driver") : t("add_driver")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Driver Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("driver_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="driverName"
              defaultValue={selectedDriver?.driverName}
              placeholder={t("enter_driver_name")}
              required
              fullWidth
            />
          </div>

          {/* License Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("license_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="licenseNumber"
              defaultValue={selectedDriver?.licenseNumber}
              placeholder={t("enter_license_number")}
              required
              fullWidth
            />
          </div>

          {/* License Expiry */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("license_expiry")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="licenseExpiry"
              type="date"
              defaultValue={
                selectedDriver?.licenseExpiry
                  ? new Date(selectedDriver.licenseExpiry).toISOString().split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("phone")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="phone"
              defaultValue={selectedDriver?.phone}
              placeholder={t("enter_phone_number")}
              required
              fullWidth
            />
          </div>

          {/* Assigned Vehicle */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("assigned_vehicle")}
            </label>
            <Select
              name="assignedVehicleId"
              defaultValue={
                typeof selectedDriver?.assignedVehicleId === "object"
                  ? (selectedDriver.assignedVehicleId as any)._id
                  : selectedDriver?.assignedVehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_vehicle")}
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
              defaultValue={selectedDriver?.status || ""}
              options={statusOptions}
              placeholder={t("select_status")}
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
            {selectedDriver ? t("save") : t("add_driver")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};