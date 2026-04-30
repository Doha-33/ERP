import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Navigation } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Trip, Vehicle, Driver } from "../../types";

interface TripFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrip: Trip | null;
  vehicles: Vehicle[];
  drivers: Driver[];
  onSave: (data: Partial<Trip>) => Promise<void>;
}

export const TripFormModal: React.FC<TripFormModalProps> = ({
  isOpen,
  onClose,
  selectedTrip,
  vehicles,
  drivers,
  onSave,
}) => {
  const { t } = useTranslation();

  const statusOptions = [
    { value: "Ongoing", label: t("ongoing") },
    { value: "Completed", label: t("completed") },
    { value: "Cancelled", label: t("cancelled") },
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
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<Trip> = {
      vehicleId: data.vehicleId as string,
      driverId: data.driverId as string,
      startLocation: data.startLocation as string,
      endLocation: data.endLocation as string,
      startTime: data.startTime as string,
      endTime: (data.endTime as string) || null,
      fuelUsed: Number(data.fuelUsed) || 0,
      distance: Number(data.distance) || 0,
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
          {selectedTrip ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedTrip ? t("edit_trip") : t("add_trip")}
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
                typeof selectedTrip?.vehicleId === "object"
                  ? (selectedTrip.vehicleId as any)._id
                  : selectedTrip?.vehicleId || ""
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
                typeof selectedTrip?.driverId === "object"
                  ? (selectedTrip.driverId as any)._id
                  : selectedTrip?.driverId || ""
              }
              options={driverOptions}
              placeholder={t("select_driver")}
              required
              fullWidth
            />
          </div>

          {/* Start Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("start_location")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="startLocation"
              defaultValue={selectedTrip?.startLocation}
              placeholder={t("enter_start_location")}
              required
              fullWidth
            />
          </div>

          {/* End Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("end_location")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="endLocation"
              defaultValue={selectedTrip?.endLocation}
              placeholder={t("enter_end_location")}
              required
              fullWidth
            />
          </div>

          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("start_time")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="startTime"
              type="datetime-local"
              defaultValue={
                selectedTrip?.startTime
                  ? new Date(selectedTrip.startTime).toISOString().slice(0, 16)
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("end_time")}
            </label>
            <Input
              name="endTime"
              type="datetime-local"
              defaultValue={
                selectedTrip?.endTime
                  ? new Date(selectedTrip.endTime).toISOString().slice(0, 16)
                  : ""
              }
              fullWidth
            />
          </div>

          {/* Fuel Used */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("fuel_used")} (L)
            </label>
            <Input
              name="fuelUsed"
              type="number"
              step="0.01"
              defaultValue={selectedTrip?.fuelUsed || 0}
              placeholder="0"
              fullWidth
            />
          </div>

          {/* Distance */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("distance")} (km)
            </label>
            <Input
              name="distance"
              type="number"
              step="0.01"
              defaultValue={selectedTrip?.distance || 0}
              placeholder="0"
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
              defaultValue={selectedTrip?.status || ""}
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
            {selectedTrip ? t("save") : t("add_trip")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};