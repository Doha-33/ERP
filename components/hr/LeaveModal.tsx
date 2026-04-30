import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Edit2, Plus, Upload, FileText, X } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
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

const compressImage = (base64Str: string, maxWidth = 1200, maxHeight = 1200): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
      } else {
        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
      }
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
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
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = typeof recordToEdit.employeeId === "object"
        ? (recordToEdit.employeeId as any)._id
        : recordToEdit.employeeId;
      
      setFormData({
        leaveId: recordToEdit.leaveId || "",
        employeeId: employeeId || "",
        leaveType: recordToEdit.leaveType || "ANNUAL",
        fromDate: recordToEdit.fromDate ? new Date(recordToEdit.fromDate).toISOString().split('T')[0] : "",
        toDate: recordToEdit.toDate ? new Date(recordToEdit.toDate).toISOString().split('T')[0] : "",
        reason: recordToEdit.reason || "",
      });
      setAttachment(recordToEdit.attachment);
    } else if (!recordToEdit && isOpen) {
      setFormData({
        leaveId: "",
        employeeId: (currentUserEmployee?._id || currentUserEmployee?.id || ""),
        leaveType: "ANNUAL",
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [recordToEdit, isOpen, currentUserEmployee]);

  const calculateDays = () => {
    if (!formData.fromDate || !formData.toDate) return 0;
    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const leaveTypeOptions = [
    { value: "ANNUAL", label: t("annual_leave") },
    { value: "SICK", label: t("sick_leave") },
    { value: "UNPAID", label: t("unpaid_leave") },
    { value: "EMERGENCY", label: t("emergency_leave") },
    { value: "MATERNITY", label: t("maternity_leave") },
    { value: "OTHER", label: t("other_leave") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const handleFileChange = async (file: File | null) => {
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        if (file.type.startsWith('image/')) {
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
        workflowStatus: recordToEdit?.workflowStatus || "PENDING_MANAGER",
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

  const days = calculateDays();

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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

          {/* Leave ID */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t("leave_id")}</label>
              <Input value={formData.leaveId} onChange={(e) => handleChange("leaveId", e.target.value)} fullWidth />
            </div>
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            {isAdmin ? (
              <Select
                value={formData.employeeId}
                onChange={(e) => handleChange("employeeId", e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
              />
            ) : (
              <>
                <Input
                  value={currentUserEmployee?.fullName || ""}
                  disabled
                  fullWidth
                />
                <input type="hidden" value={formData.employeeId} />
              </>
            )}
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

          {/* From Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("from_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.fromDate}
              onChange={(e) => handleChange("fromDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("to_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.toDate}
              onChange={(e) => handleChange("toDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Days Display */}
          {days > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
              <Calendar size={18} className="text-blue-600" />
              <div>
                <p className="text-xs text-blue-600">{t("total_days")}</p>
                <p className="text-lg font-bold text-blue-700">{days} {t("days")}</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder={t("enter_reason")}
              rows={3}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Attachment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("attachment")}
          </label>
          <FileUpload label={"Upload file"} onChange={handleFileChange} accept="image/*,application/pdf" />
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
            {recordToEdit ? t("save") : t("add_leaves")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};