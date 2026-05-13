import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Laptop, Hash, Calendar, UserCheck, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { AssignLaptop } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

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
    status: "Pending",  // API expects: Pending, Done, Canceled
    notes: "",
  });

  const isAdmin = user?.role === "admin";

  // Helper function to extract ID
  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  // Generate serial number
  const generateSerialNumber = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DEV-${timestamp}-${random}`;
  }, []);

  useEffect(() => {
    if (laptopToEdit && isOpen) {
      // Extract employee ID from employeeInfo
      let employeeId = "";
      if (laptopToEdit.employeeInfo) {
        if (typeof laptopToEdit.employeeInfo === 'object') {
          employeeId = extractId(laptopToEdit.employeeInfo);
        } else {
          employeeId = laptopToEdit.employeeInfo;
        }
      } else if (laptopToEdit.employeeId) {
        if (typeof laptopToEdit.employeeId === 'object') {
          employeeId = extractId(laptopToEdit.employeeId);
        } else {
          employeeId = laptopToEdit.employeeId;
        }
      }
      
      // Map status to API expected values
      let statusValue = laptopToEdit.status || "Pending";
      // Convert Assigned -> Done, Returned -> Canceled (if needed)
      if (statusValue === "Assigned") statusValue = "Done";
      if (statusValue === "Returned") statusValue = "Canceled";

      setFormData({
        employeeInfo: employeeId || "",
        deviceType: laptopToEdit.deviceType || "Laptop",
        serialNumber: laptopToEdit.serialNumber || "",
        doneAt: laptopToEdit.doneAt || laptopToEdit.assignmentDate
          ? new Date(laptopToEdit.doneAt || laptopToEdit.assignmentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        doneBy: laptopToEdit.doneBy || "",
        status: statusValue,
        notes: laptopToEdit.notes || "",
      });
    } else if (!laptopToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        deviceType: "Laptop",
        serialNumber: generateSerialNumber(),
        doneAt: new Date().toISOString().split("T")[0],
        doneBy: isAdmin ? "" : user?.username || "",
        status: "Pending",
        notes: "",
      });
    }
  }, [laptopToEdit, isOpen, isAdmin, user, extractId, generateSerialNumber]);

  const deviceTypeOptions = [
    { value: "Laptop", label: t("laptop") },
    { value: "Monitor", label: t("monitor") },
    { value: "Phone", label: t("phone") },
    { value: "Tablet", label: t("tablet") },
    { value: "Mouse", label: t("mouse") },
    { value: "Keyboard", label: t("keyboard") },
  ];

  // API expects: Pending, Done, Canceled
  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Done", label: t("done") },
    { value: "Canceled", label: t("canceled") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeInfo) {
      toast.error(t("employee_required"));
      return;
    }
    if (!formData.deviceType) {
      toast.error(t("device_type_required"));
      return;
    }
    if (!formData.serialNumber.trim()) {
      toast.error(t("serial_number_required"));
      return;
    }
    if (!formData.doneAt) {
      toast.error(t("assignment_date_required"));
      return;
    }
    if (!formData.doneBy.trim()) {
      toast.error(t("done_by_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected employee for empCode
      const selectedEmployee = employees.find(e => extractId(e) === formData.employeeInfo);
      
      const saveData: any = {
        employeeInfo: formData.employeeInfo,
        deviceType: formData.deviceType,
        serialNumber: formData.serialNumber,
        doneAt: formData.doneAt,
        doneBy: formData.doneBy,
        status: formData.status, // Pending, Done, Canceled
        notes: formData.notes || undefined,
        empCode: selectedEmployee?.employeeCode || "",
      };
      
      // If editing, include the ID
      if (laptopToEdit) {
        const laptopId = extractId(laptopToEdit);
        if (laptopId) {
          saveData._id = laptopId;
          saveData.id = laptopId;
        }
      }
      
      console.log("Saving assigned device:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_assign_laptop"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get status color for visual feedback
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-orange-600 bg-orange-50";
      case "Done": return "text-green-600 bg-green-50";
      case "Canceled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
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
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.employeeInfo}
                onChange={(e) => handleChange("employeeInfo", e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
                className="pl-10"
                disabled={!!laptopToEdit}
              />
            </div>
          </div>

          {/* Device Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("device_type")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Laptop size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.deviceType}
                onChange={(e) => handleChange("deviceType", e.target.value)}
                options={deviceTypeOptions}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Serial Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("serial_number")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.serialNumber}
                onChange={(e) => handleChange("serialNumber", e.target.value)}
                placeholder="SN-123456"
                required
                fullWidth
                className="pl-10"
                disabled={!!laptopToEdit}
              />
            </div>
          </div>

          {/* Done At */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("assignment_date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.doneAt}
                onChange={(e) => handleChange("doneAt", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Done By */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("done_by")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.doneBy}
                onChange={(e) => handleChange("doneBy", e.target.value)}
                placeholder={t("enter_done_by")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Status - API expects Pending, Done, Canceled */}
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
            <p className="text-xs text-gray-500">{t("status_description")}</p>
          </div>

          {/* Notes */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("notes")}
            </label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder={t("enter_notes")}
                rows={3}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Status Preview */}
        <div className={`rounded-xl p-4 border ${getStatusColor(formData.status)}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">{t("status_info")}</p>
              <p className="text-xs opacity-75">
                {formData.status === "Pending" && t("pending_status_description")}
                {formData.status === "Done" && t("done_status_description")}
                {formData.status === "Canceled" && t("canceled_status_description")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
            type="button"
          >
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {laptopToEdit ? t("update_assign_laptop") : t("add_assign_laptop")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};