import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Edit2, Plus, Upload, FileText, X, Clock, UserCheck, AlertCircle, User } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import {
  Button,
  Input,
  Select,
  TextArea,
  FileUpload,
  Badge,
} from "../../components/ui/Common";
import { Leave, Employee } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Leave>) => Promise<void>;
  recordToEdit?: Leave | null;
  isLoading?: boolean;
}

const compressImage = (
  base64Str: string,
  maxWidth = 1200,
  maxHeight = 1200,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const LeaveModal: React.FC<LeaveModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees, currentUserEmployee } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [formData, setFormData] = useState({
    leaveId: "",
    employeeId: "",
    leaveType: "ANNUAL",
    fromDate: "",
    toDate: "",
    reason: "",
    remainingBalance: 0,
    workflowStatus: "PENDING_MANAGER",
    approverId: "",
  });

  const isAdmin = user?.role === "admin";

  const extractId = useCallback((value: any): string => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id && typeof value._id === "string") return value._id;
      if (value.id && typeof value.id === "string") return value.id;
    }
    return "";
  }, []);

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = extractId(recordToEdit.employeeId);
      const approverId = extractId(recordToEdit.approverId);

      setFormData({
        leaveId: recordToEdit.leaveId || "",
        employeeId: employeeId || "",
        leaveType: recordToEdit.leaveType || "ANNUAL",
        fromDate: recordToEdit.fromDate
          ? new Date(recordToEdit.fromDate).toISOString().split("T")[0]
          : "",
        toDate: recordToEdit.toDate
          ? new Date(recordToEdit.toDate).toISOString().split("T")[0]
          : "",
        reason: recordToEdit.reason || "",
        remainingBalance: recordToEdit.remainingBalance || 0,
        workflowStatus: recordToEdit.workflowStatus || "PENDING_MANAGER",
        approverId: approverId || "",
      });
      setAttachment(recordToEdit.attachment);
    } else if (!recordToEdit && isOpen) {
      setFormData({
        leaveId: "",
        employeeId: currentUserEmployee?._id || currentUserEmployee?.id || "",
        leaveType: "ANNUAL",
        fromDate: new Date().toISOString().split("T")[0],
        toDate: new Date().toISOString().split("T")[0],
        reason: "",
        remainingBalance: 0,
        workflowStatus: "PENDING_MANAGER",
        approverId: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [recordToEdit, isOpen, currentUserEmployee, extractId]);

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    return (
      Math.ceil(
        Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1
    );
  };

  const leaveTypeOptions = [
    { value: "ANNUAL", label: t("annual_leave") },
    { value: "SICK", label: t("sick_leave") },
    { value: "UNPAID", label: t("unpaid_leave") },
    { value: "EMERGENCY", label: t("emergency_leave") },
    { value: "MATERNITY", label: t("maternity_leave") },
    { value: "OTHER", label: t("other_leave") },
  ];

  const workflowStatusOptions = [
    { value: "PENDING_MANAGER", label: t("pending_manager") },
    { value: "PENDING_HR", label: t("pending_hr") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const employeeOptions = employees.map((emp) => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const approverOptions = [
    { value: "", label: t("select_approver") },
    ...employees.map((emp) => ({
      value: extractId(emp),
      label: `${emp.fullName} (${emp.employeeCode})`,
    })),
  ];

  const handleFileChange = async (file: File | null) => {
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith("image/")) {
          const compressed = await compressImage(result);
          setAttachment(compressed);
        } else {
          setAttachment(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setAttachment(undefined);
      setAttachmentName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const days = calculateDays();

    try {
      await onSave({
        ...formData,
        days,
        attachment: attachment,
        status: recordToEdit?.status || "PENDING",
        workflowStatus: formData.workflowStatus,
        remainingBalance: formData.remainingBalance,
        approverId: formData.approverId || undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const days = calculateDays();

  // Get workflow status badge color
  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_MANAGER":
        return "text-orange-600 bg-orange-50";
      case "PENDING_HR":
        return "text-blue-600 bg-blue-50";
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Get workflow status label
  const getWorkflowStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING_MANAGER":
        return t("pending_manager_approval");
      case "PENDING_HR":
        return t("pending_hr_approval");
      case "APPROVED":
        return t("approved");
      case "REJECTED":
        return t("rejected");
      default:
        return status;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {recordToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {recordToEdit ? t("edit_leaves") : t("add_leaves")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Leave ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("leave_id")}
            </label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.leaveId}
                onChange={(e) => handleChange("leaveId", e.target.value)}
                fullWidth
                className="pl-10"
                disabled={!!recordToEdit}
              />
            </div>
          </div>

          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              {isAdmin ? (
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
              ) : (
                <>
                  <Input
                    value={currentUserEmployee?.fullName || ""}
                    disabled
                    fullWidth
                    className="pl-10"
                  />
                  <input type="hidden" value={formData.employeeId} />
                </>
              )}
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("leave_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.leaveType}
              onChange={(e) => handleChange("leaveType", e.target.value)}
              options={leaveTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Remaining Balance */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("remaining_balance")} ({t("days")})
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                min="0"
                value={formData.remainingBalance}
                onChange={(e) => handleChange("remainingBalance", Number(e.target.value))}
                placeholder="0"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("from_date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.fromDate}
                onChange={(e) => handleChange("fromDate", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("to_date")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.toDate}
                onChange={(e) => handleChange("toDate", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Days Display */}
          {days > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
              <Calendar size={18} className="text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">{t("total_days")}</p>
                <p className="text-lg font-bold text-blue-700">
                  {days} {t("days")}
                </p>
              </div>
            </div>
          )}

          {/* Workflow Status (only for edit) */}
          {recordToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("workflow_status")}
              </label>
              <div className="relative">
                <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.workflowStatus}
                  onChange={(e) => handleChange("workflowStatus", e.target.value)}
                  options={workflowStatusOptions}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Approver (only for edit) */}
          {recordToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("approver")}
              </label>
              <div className="relative">
                <UserCheck size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Select
                  value={formData.approverId}
                  onChange={(e) => handleChange("approverId", e.target.value)}
                  options={approverOptions}
                  placeholder={t("select_approver")}
                  fullWidth
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder={t("enter_reason")}
                rows={3}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Summary Preview */}
        {days > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-600" />
              {t("leave_summary")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">{t("leave_type")}</p>
                <p className="text-sm font-medium">
                  {leaveTypeOptions.find(o => o.value === formData.leaveType)?.label || formData.leaveType}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("total_days")}</p>
                <p className="text-lg font-bold text-indigo-600">{days}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("remaining_balance")}</p>
                <p className="text-sm font-medium">{formData.remainingBalance} {t("days")}</p>
              </div>
              {recordToEdit && (
                <div>
                  <p className="text-xs text-gray-500">{t("workflow_status")}</p>
                  <Badge className={`mt-1 ${getWorkflowStatusColor(formData.workflowStatus)}`}>
                    {getWorkflowStatusLabel(formData.workflowStatus)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attachment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("attachment")}
          </label>
          <div className="relative">
            <Upload size={18} className="absolute left-3 top-3 text-gray-400" />
            <FileUpload
              label={"Upload file"}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
          </div>
          {attachmentName && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <FileText size={14} />
              <span>{attachmentName}</span>
              <button
                type="button"
                onClick={() => {
                  setAttachment(undefined);
                  setAttachmentName("");
                }}
                className="text-red-500 hover:text-red-700"
              >
                <X size={14} />
              </button>
            </div>
          )}
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
            {recordToEdit ? t("update_leave") : t("add_leaves")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};