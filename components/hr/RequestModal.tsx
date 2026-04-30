import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Upload, FileText, X, Calendar, Flag } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { RequestRecord } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<RequestRecord>) => Promise<void>;
  recordToEdit?: RequestRecord | null;
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
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height *= maxWidth / width;
          width = maxWidth;
        } else {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const RequestModal: React.FC<RequestModalProps> = ({
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
    employeeId: "",
    requestType: "LEAVE",
    description: "",
    priority: "MEDIUM",
    requestNumber: "",
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (recordToEdit && isOpen) {
      const employeeId = typeof recordToEdit.employeeId === "object"
        ? (recordToEdit.employeeId as any)._id
        : recordToEdit.employeeId;
      
      setFormData({
        employeeId: employeeId || "",
        requestType: recordToEdit.requestType || "LEAVE",
        description: recordToEdit.description || "",
        priority: recordToEdit.priority || "MEDIUM",
        requestNumber: recordToEdit.requestNumber || recordToEdit._id?.slice(-8) || "",
      });
      setAttachment(recordToEdit.attachment);
    } else if (!recordToEdit && isOpen) {
      setFormData({
        employeeId: (currentUserEmployee?._id || currentUserEmployee?.id || ""),
        requestType: "LEAVE",
        description: "",
        priority: "MEDIUM",
        requestNumber: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [recordToEdit, isOpen, currentUserEmployee]);

  const requestTypeOptions = [
    { value: "LEAVE", label: t("leave_request") },
    { value: "LOAN", label: t("loan_request") },
    { value: "SALARY_CERTIFICATE", label: t("salary_certificate") },
    { value: "EQUIPMENT", label: t("equipment_request") },
    { value: "PROFILE_UPDATE", label: t("profile_update") },
    { value: "OTHER", label: t("other_request") },
  ];

  const priorityOptions = [
    { value: "LOW", label: t("low") },
    { value: "MEDIUM", label: t("medium") },
    { value: "HIGH", label: t("high") },
    { value: "URGENT", label: t("urgent") },
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
    
    try {
      await onSave({
        ...formData,
        attachment: attachment,
        status: recordToEdit?.status || "PENDING",
        requestDate: new Date().toISOString(),
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
          {recordToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {recordToEdit ? t("edit_request") : t("add_request")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

          {/* Request Number */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t("request_number")}</label>
              <Input
                value={formData.requestNumber}
                onChange={(e) => handleChange("requestNumber", e.target.value)}
                fullWidth
              />
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

          {/* Request Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("request_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.requestType}
              onChange={(e) => handleChange("requestType", e.target.value)}
              options={requestTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("priority")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              options={priorityOptions}
              required
              fullWidth
            />
          </div>

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("enter_description")}
              rows={4}
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
          <FileUpload label={"Upload File"} onChange={handleFileChange} accept="image/*,application/pdf" />
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
            {recordToEdit ? t("save") : t("add_request")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};