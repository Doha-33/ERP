import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Car } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Vehicle } from "../../types";

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicle: Vehicle | null;
  onSave: (data: Partial<Vehicle>) => Promise<void>;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  isOpen,
  onClose,
  selectedVehicle,
  onSave,
}) => {
  const { t } = useTranslation();

  const vehicleTypes = [
    { value: "Sedan", label: "Sedan" },
    { value: "Car", label: "Car" },
    { value: "Truck", label: "Truck" },
    { value: "Van", label: "Van" },
    { value: "Bus", label: "Bus" },
    { value: "Motorcycle", label: "Motorcycle" },
  ];

  const fuelTypes = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Electric", label: "Electric" },
    { value: "Gasoline", label: "Gasoline" },
  ];

  const statusOptions = [
    { value: "Active", label: t("active") },
    { value: "In Maintenance", label: t("in_maintenance") },
    { value: "Inactive", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<Vehicle> = {
      plateNumber: data.plateNumber as string,
      model: data.model as string,
      type: data.type as string,
      fuelType: data.fuelType as string,
      mileage: Number(data.mileage),
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
          {selectedVehicle ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedVehicle ? t("edit_vehicle") : t("add_vehicle")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Plate Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("plate_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="plateNumber"
              defaultValue={selectedVehicle?.plateNumber}
              placeholder={t("enter_plate_number")}
              required
              fullWidth
            />
          </div>

          {/* Model */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("model")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="model"
              defaultValue={selectedVehicle?.model}
              placeholder={t("enter_model")}
              required
              fullWidth
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="type"
              defaultValue={selectedVehicle?.type || ""}
              options={vehicleTypes}
              placeholder={t("select_vehicle_type")}
              required
              fullWidth
            />
          </div>

          {/* Fuel Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("fuel_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="fuelType"
              defaultValue={selectedVehicle?.fuelType || ""}
              options={fuelTypes}
              placeholder={t("select_fuel_type")}
              required
              fullWidth
            />
          </div>

          {/* Mileage */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("mileage")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="mileage"
              type="number"
              defaultValue={selectedVehicle?.mileage}
              placeholder={t("enter_mileage")}
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
              defaultValue={selectedVehicle?.status || ""}
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
            {selectedVehicle ? t("save") : t("add_vehicle")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};