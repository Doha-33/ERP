import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, UserPlus, Edit2, Timer, TrendingUp, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select } from "../../components/ui/Common";
import { Attendance, Employee } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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
    workingHours: 0,
    overtimeHours: 0,
    lateMinutes: 0,
    earlyLeaveMinutes: 0,
    notes: "",
  });

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  // Helper function to calculate working hours
  const calculateWorkingHours = useCallback((checkIn: string, checkOut: string, breakDuration: number): number => {
    if (!checkIn || !checkOut) return 0;
    try {
      const [inHours, inMinutes] = checkIn.split(':').map(Number);
      const [outHours, outMinutes] = checkOut.split(':').map(Number);
      
      let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
      if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
      
      totalMinutes -= breakDuration;
      return Math.max(0, totalMinutes / 60);
    } catch {
      return 0;
    }
  }, []);

  // Helper function to combine date and time into ISO string
  const combineDateTime = (dateStr: string, timeStr: string): string | undefined => {
    if (!dateStr) return undefined;
    if (!timeStr) return undefined;
    
    try {
      const [year, month, day] = dateStr.split('-');
      const [hours, minutes] = timeStr.split(':');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
      return date.toISOString();
    } catch (error) {
      console.error("Error combining date and time:", error);
      return undefined;
    }
  };

  // Helper function to extract time from ISO string
  const extractTimeFromISO = (isoString: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toTimeString().slice(0, 5);
    } catch {
      return "";
    }
  };

  // Helper function to extract date from ISO string
  const extractDateFromISO = (isoString: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = extractId(recordToEdit.employeeId);

      setFormData({
        employeeId: employeeId || "",
        date: extractDateFromISO(recordToEdit.date),
        checkInTime: extractTimeFromISO(recordToEdit.checkInTime),
        checkOutTime: extractTimeFromISO(recordToEdit.checkOutTime),
        shiftType: recordToEdit.shiftType || "MORNING",
        breakDuration: recordToEdit.breakDuration || 0,
        status: recordToEdit.status || "PRESENT",
        workingHours: recordToEdit.workingHours || 0,
        overtimeHours: recordToEdit.overtimeHours || 0,
        lateMinutes: recordToEdit.lateMinutes || 0,
        earlyLeaveMinutes: recordToEdit.earlyLeaveMinutes || 0,
        notes: recordToEdit.notes || "",
      });
    } else if (!recordToEdit && isOpen) {
      setFormData({
        employeeId: "",
        date: new Date().toISOString().split('T')[0],
        checkInTime: "",
        checkOutTime: "",
        shiftType: "MORNING",
        breakDuration: 0,
        status: "PRESENT",
        workingHours: 0,
        overtimeHours: 0,
        lateMinutes: 0,
        earlyLeaveMinutes: 0,
        notes: "",
      });
    }
  }, [recordToEdit, isOpen]);

  // Auto-calculate working hours when checkIn, checkOut, or breakDuration changes
  useEffect(() => {
    if (formData.checkInTime && formData.checkOutTime) {
      const calculatedHours = calculateWorkingHours(
        formData.checkInTime,
        formData.checkOutTime,
        formData.breakDuration
      );
      setFormData(prev => ({ ...prev, workingHours: parseFloat(calculatedHours.toFixed(1)) }));
    }
  }, [formData.checkInTime, formData.checkOutTime, formData.breakDuration, calculateWorkingHours]);

  const employeeOptions = employees.map((emp) => ({
    value: extractId(emp),
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
    
    if (!formData.employeeId) {
      toast.error(t("employee_required"));
      return;
    }
    if (!formData.date) {
      toast.error(t("date_required"));
      return;
    }
    
    setIsSubmitting(true);

    try {
      const saveData: any = {
        employeeId: formData.employeeId,
        date: combineDateTime(formData.date, "00:00"),
        shiftType: formData.shiftType,
        breakDuration: formData.breakDuration,
        status: formData.status,
        workingHours: formData.workingHours,
        overtimeHours: formData.overtimeHours,
        lateMinutes: formData.lateMinutes,
        earlyLeaveMinutes: formData.earlyLeaveMinutes,
        notes: formData.notes || undefined,
      };
      
      if (formData.checkInTime) {
        saveData.checkInTime = combineDateTime(formData.date, formData.checkInTime);
      }
      
      if (formData.checkOutTime) {
        saveData.checkOutTime = combineDateTime(formData.date, formData.checkOutTime);
      }
      
      console.log("Saving attendance:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_attendance"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get status color for preview
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT": return "text-green-600 bg-green-50";
      case "ABSENT": return "text-red-600 bg-red-50";
      case "LATE": return "text-orange-600 bg-orange-50";
      case "LEAVE": return "text-blue-600 bg-blue-50";
      case "PERMISSION": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
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
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserPlus size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.employeeId}
                onChange={(e) => handleChange("employeeId", e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
                className="pl-10"
                disabled={!!recordToEdit}
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
                fullWidth
                className="pl-10"
                disabled={!!recordToEdit}
              />
            </div>
          </div>

          {/* Check In Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("check_in_time")}
            </label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => handleChange("checkInTime", e.target.value)}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Check Out Time */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("check_out_time")}
            </label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => handleChange("checkOutTime", e.target.value)}
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Shift Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("shift_type")}
            </label>
            <Select
              value={formData.shiftType}
              onChange={(e) => handleChange("shiftType", e.target.value)}
              options={shiftTypeOptions}
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
              min="0"
              value={formData.breakDuration}
              onChange={(e) => handleChange("breakDuration", Number(e.target.value))}
              placeholder="0"
              fullWidth
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")}
            </label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
              fullWidth
            />
          </div>

          {/* Working Hours */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("working_hours")} (hrs)
            </label>
            <div className="relative">
              <Timer size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.workingHours}
                onChange={(e) => handleChange("workingHours", Number(e.target.value))}
                placeholder="0"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Overtime Hours */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("overtime_hours")} (hrs)
            </label>
            <div className="relative">
              <TrendingUp size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.1"
                min="0"
                value={formData.overtimeHours}
                onChange={(e) => handleChange("overtimeHours", Number(e.target.value))}
                placeholder="0"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Late Minutes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("late_minutes")}
            </label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                min="0"
                value={formData.lateMinutes}
                onChange={(e) => handleChange("lateMinutes", Number(e.target.value))}
                placeholder="0"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Early Leave Minutes */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("early_leave_minutes")}
            </label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                min="0"
                value={formData.earlyLeaveMinutes}
                onChange={(e) => handleChange("earlyLeaveMinutes", Number(e.target.value))}
                placeholder="0"
                fullWidth
                className="pl-10"
              />
            </div>
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

        {/* Summary Preview */}
        {formData.workingHours > 0 && (
          <div className={`rounded-xl p-4 border ${getStatusColor(formData.status)}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-medium opacity-70">{t("working_hours")}</p>
                <p className="text-lg font-bold">{formData.workingHours} hrs</p>
              </div>
              <div>
                <p className="text-xs font-medium opacity-70">{t("overtime_hours")}</p>
                <p className="text-lg font-bold">{formData.overtimeHours} hrs</p>
              </div>
              <div>
                <p className="text-xs font-medium opacity-70">{t("late_minutes")}</p>
                <p className="text-lg font-bold">{formData.lateMinutes} min</p>
              </div>
              <div>
                <p className="text-xs font-medium opacity-70">{t("early_leave_minutes")}</p>
                <p className="text-lg font-bold">{formData.earlyLeaveMinutes} min</p>
              </div>
            </div>
          </div>
        )}

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
            {recordToEdit ? t("update_attendance") : t("add_attendance")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};