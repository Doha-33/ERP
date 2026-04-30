import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, UserPlus, Edit2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Attendance, Employee } from "../../types";
import { useData } from "../../context/DataContext";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Partial<Attendance>) => Promise<void>;
  recordToEdit?: Attendance | null;
  isLoading?: boolean;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    checkInTime: "",
    checkOutTime: "",
    shiftType: "MORNING",
    breakDuration: 0,
    status: "PRESENT",
    notes: "",
  });

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = typeof recordToEdit.employeeId === "object" 
        ? (recordToEdit.employeeId as any)._id 
        : recordToEdit.employeeId;
      
      const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toISOString().split("T")[0];
      };

      const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        return new Date(timeStr).toISOString().slice(11, 16);
      };

      setFormData({
        employeeId: employeeId || "",
        date: formatDate(recordToEdit.date),
        checkInTime: formatTime(recordToEdit.checkInTime),
        checkOutTime: formatTime(recordToEdit.checkOutTime),
        shiftType: recordToEdit.shiftType || "MORNING",
        breakDuration: recordToEdit.breakDuration || 0,
        status: recordToEdit.status || "PRESENT",
        notes: recordToEdit.notes || "",
      });
    } else if (!recordToEdit && isOpen) {
      setFormData({
        employeeId: "",
        date: new Date().toISOString().split("T")[0],
        checkInTime: "",
        checkOutTime: "",
        shiftType: "MORNING",
        breakDuration: 0,
        status: "PRESENT",
        notes: "",
      });
    }
  }, [recordToEdit, isOpen]);

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const shiftTypeOptions = [
    { value: "MORNING", label: t("morning") },
    { value: "NIGHT", label: t("night") },
    { value: "EVENING", label: t("evening") },
  ];

  const statusOptions = [
    { value: "PRESENT", label: t("present") },
    { value: "ABSENT", label: t("absent") },
    { value: "LATE", label: t("late") },
    { value: "LEAVE", label: t("on_leave") },
    { value: "PERMISSION", label: t("permission") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
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
          {recordToEdit ? <Edit2 size={20} /> : <UserPlus size={20} />}
          {recordToEdit ? t("edit_attendance") : t("add_attendance")}
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
              value={formData.employeeId}
              onChange={(e) => handleChange("employeeId", e.target.value)}
              options={employeeOptions}
              placeholder={t("select_employee")}
              required
              fullWidth
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Check In Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("check_in_time")}
            </label>
            <Input
              type="time"
              value={formData.checkInTime}
              onChange={(e) => handleChange("checkInTime", e.target.value)}
              fullWidth
            />
          </div>

          {/* Check Out Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("check_out_time")}
            </label>
            <Input
              type="time"
              value={formData.checkOutTime}
              onChange={(e) => handleChange("checkOutTime", e.target.value)}
              fullWidth
            />
          </div>

          {/* Shift Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("shift_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.shiftType}
              onChange={(e) => handleChange("shiftType", e.target.value)}
              options={shiftTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Break Duration */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("break_duration")} (mins)
            </label>
            <Input
              type="number"
              value={formData.breakDuration}
              onChange={(e) => handleChange("breakDuration", Number(e.target.value))}
              placeholder="0"
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
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none h-24"
              placeholder={t("enter_notes")}
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
            {recordToEdit ? t("save") : t("add_attendance")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};