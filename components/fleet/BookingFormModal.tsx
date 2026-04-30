import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, Calendar } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { VehicleBooking, Vehicle } from "../../types";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBooking: VehicleBooking | null;
  vehicles: Vehicle[];
  onSave: (data: Partial<VehicleBooking>) => Promise<void>;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  selectedBooking,
  vehicles,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
    { value: "Completed", label: t("completed") },
  ];

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.plateNumber} - ${vehicle.model} (${vehicle.vehicleCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const processedData: Partial<VehicleBooking> = {
      vehicleId: formData.get('vehicleId') as string,
      requestedBy: formData.get('requestedBy') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      purpose: formData.get('purpose') as string,
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
          {selectedBooking ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedBooking ? t("edit_booking") : t("add_booking")}
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
                typeof selectedBooking?.vehicleId === "object"
                  ? (selectedBooking.vehicleId as any)._id
                  : selectedBooking?.vehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_booking_vehicle")}
              required
              fullWidth
            />
          </div>

          {/* Requested By */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("requested_by")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="requestedBy"
              defaultValue={selectedBooking?.requestedBy || ""}
              placeholder={t("enter_requested_by")}
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
                selectedBooking?.startDate
                  ? new Date(selectedBooking.startDate).toISOString().split("T")[0]
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
                selectedBooking?.endDate
                  ? new Date(selectedBooking.endDate).toISOString().split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Purpose */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("purpose")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="purpose"
              defaultValue={selectedBooking?.purpose || ""}
              placeholder={t("enter_purpose")}
              rows={3}
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
              defaultValue={selectedBooking?.status || "Pending"}
              options={statusOptions}
              placeholder={t("select_booking_status")}
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
            {selectedBooking ? t("save") : t("add_booking")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};