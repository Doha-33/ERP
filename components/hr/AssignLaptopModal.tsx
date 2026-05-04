import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Laptop, Hash, Calendar, UserCheck, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { AssignLaptop } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

interface AssignLaptopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AssignLaptop>) => Promise<void>;
  laptopToEdit?: AssignLaptop | null;
  isLoading?: boolean;
}

export const AssignLaptopModal: React.FC<AssignLaptopModalProps> = ({
  isOpen,
  onClose,
  onSave,
  laptopToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    deviceType: "Laptop",
    serialNumber: "",
    doneAt: new Date().toISOString().split("T")[0],
    doneBy: "",
    status: "Pending",
    notes: "",
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (laptopToEdit && isOpen) {
      const employeeId = typeof laptopToEdit.employeeInfo === "object"
        ? (laptopToEdit.employeeInfo as any)?._id
        : laptopToEdit.employeeInfo || laptopToEdit.employeeId;

      setFormData({
        employeeInfo: employeeId || "",
        deviceType: laptopToEdit.deviceType || "Laptop",
        serialNumber: laptopToEdit.serialNumber || "",
        doneAt: laptopToEdit.doneAt || laptopToEdit.assignmentDate
          ? new Date(laptopToEdit.doneAt || laptopToEdit.assignmentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        doneBy: laptopToEdit.doneBy || "",
        status: laptopToEdit.status || "Pending",
        notes: laptopToEdit.notes || "",
      });
    } else if (!laptopToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        deviceType: "Laptop",
        serialNumber: "",
        doneAt: new Date().toISOString().split("T")[0],
        doneBy: isAdmin ? "" : user?.username || "",
        status: "Pending",
        notes: "",
      });
    }
  }, [laptopToEdit, isOpen, isAdmin, user]);

  const deviceTypeOptions = [
    { value: "Laptop", label: t("laptop"), icon: Laptop },
    { value: "Monitor", label: t("monitor") },
    { value: "Phone", label: t("phone") },
    { value: "Tablet", label: t("tablet") },
    { value: "Mouse", label: t("mouse") },
    { value: "Keyboard", label: t("keyboard") },
  ];

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Assigned", label: t("assigned") },
    { value: "Returned", label: t("returned") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get selected employee for empCode
      const selectedEmployee = employees.find(e => (e._id || e.id) === formData.employeeInfo);
      
      await onSave({
        ...formData,
        empCode: selectedEmployee?.employeeCode || "",
      });
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {laptopToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {laptopToEdit ? t("edit_assign_laptop") : t("add_assign_laptop")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.employeeInfo}
              onChange={(e) => handleChange("employeeInfo", e.target.value)}
              options={employeeOptions}
              placeholder={t("select_employee")}
              required
              fullWidth
            />
          </div>

          {/* Device Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("device_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.deviceType}
              onChange={(e) => handleChange("deviceType", e.target.value)}
              options={deviceTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Serial Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("serial_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.serialNumber}
              onChange={(e) => handleChange("serialNumber", e.target.value)}
              placeholder="SN-123456"
              required
              fullWidth
            />
          </div>

          {/* Done At */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("assignment_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.doneAt}
              onChange={(e) => handleChange("doneAt", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Done By */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("done_by")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.doneBy}
              onChange={(e) => handleChange("doneBy", e.target.value)}
              placeholder={t("enter_done_by")}
              required
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              required
              fullWidth
            />
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("notes")}
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder={t("enter_notes")}
              rows={3}
              fullWidth
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting || isLoading}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {laptopToEdit ? t("save") : t("add_assign_laptop")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};