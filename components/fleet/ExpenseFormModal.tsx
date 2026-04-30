import React from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, DollarSign } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { VehicleExpense, Vehicle } from "../../types";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExpense: VehicleExpense | null;
  vehicles: Vehicle[];
  onSave: (data: Partial<VehicleExpense>) => Promise<void>;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  selectedExpense,
  vehicles,
  onSave,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const expenseTypes = [
    { value: "Insurance", label: t("insurance") },
    { value: "Registration", label: t("registration") },
    { value: "Maintenance", label: t("maintenance") },
    { value: "Fuel", label: t("fuel") },
    { value: "Other", label: t("other") },
  ];

  const statusOptions = [
    { value: "Paid", label: t("paid") },
    { value: "Pending", label: t("pending") },
  ];

  const vehicleOptions = vehicles.map(vehicle => ({
    value: vehicle._id,
    label: `${vehicle.plateNumber} - ${vehicle.model} (${vehicle.vehicleCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    const processedData: Partial<VehicleExpense> = {
      vehicleId: formData.get('vehicleId') as string,
      type: formData.get('type') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      description: formData.get('description') as string,
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
          {selectedExpense ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedExpense ? t("edit_vehicle_expense") : t("add_vehicle_expense")}
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
                typeof selectedExpense?.vehicleId === "object"
                  ? (selectedExpense.vehicleId as any)._id
                  : selectedExpense?.vehicleId || ""
              }
              options={vehicleOptions}
              placeholder={t("select_expense_vehicle")}
              required
              fullWidth
            />
          </div>

          {/* Expense Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("type")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="type"
              defaultValue={selectedExpense?.type || ""}
              options={expenseTypes}
              placeholder={t("select_expense_type")}
              required
              fullWidth
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              defaultValue={selectedExpense?.amount || 0}
              placeholder={t("enter_amount")}
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
                selectedExpense?.date
                  ? new Date(selectedExpense.date).toISOString().split("T")[0]
                  : ""
              }
              required
              fullWidth
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("description")}
            </label>
            <TextArea
              name="description"
              defaultValue={selectedExpense?.description || ""}
              placeholder={t("enter_description")}
              rows={3}
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
              defaultValue={selectedExpense?.status || "Pending"}
              options={statusOptions}
              placeholder={t("select_expense_status")}
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
            {selectedExpense ? t("save") : t("add_vehicle_expense")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};