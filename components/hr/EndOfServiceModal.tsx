import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Calendar, FileText, DollarSign, AlertCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { EndOfService } from "../../types";
import { useData } from "../../context/DataContext";

interface EndOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EndOfService>) => Promise<void>;
  eosToEdit?: EndOfService | null;
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

export const EndOfServiceModal: React.FC<EndOfServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eosToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [formData, setFormData] = useState({
    employeeInfo: "",
    lastWorkingDay: new Date().toISOString().split("T")[0],
    reasonForLeaving: "Resignation",
    endOfServiceBenefits: 0,
    status: "Pending",
    notes: "",
  });

  useEffect(() => {
    if (eosToEdit && isOpen) {
      const employeeId = typeof eosToEdit.employeeId === "object"
        ? (eosToEdit.employeeId as any)?._id
        : eosToEdit.employeeId || eosToEdit.employeeInfo;

      setFormData({
        employeeInfo: employeeId || "",
        lastWorkingDay: eosToEdit.lastWorkingDay
          ? new Date(eosToEdit.lastWorkingDay).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reasonForLeaving: eosToEdit.reasonForLeaving || "Resignation",
        endOfServiceBenefits: eosToEdit.endOfServiceBenefits || 0,
        status: eosToEdit.status || "Pending",
        notes: eosToEdit.notes || "",
      });
      setAttachment(eosToEdit.attachment);
    } else if (!eosToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        lastWorkingDay: new Date().toISOString().split("T")[0],
        reasonForLeaving: "Resignation",
        endOfServiceBenefits: 0,
        status: "Pending",
        notes: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [eosToEdit, isOpen]);

  const employeeOptions = [
    { value: "", label: t("select_employee") },
    ...employees.map(emp => ({
      value: emp._id || emp.id,
      label: `${emp.fullName} (${emp.employeeCode})`,
    })),
  ];

  const reasonOptions = [
    { value: "Resignation", label: t("resignation") },
    { value: "Termination", label: t("termination") },
    { value: "Retirement", label: t("retirement") },
    { value: "Contract Expiry", label: t("contract_expiry") },
  ];

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

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
          {eosToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {eosToEdit ? t("edit_end_of_service") : t("add_end_of_service")}
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

          {/* Last Working Day */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("last_working_day")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.lastWorkingDay}
              onChange={(e) => handleChange("lastWorkingDay", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Reason for Leaving */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason_for_leaving")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.reasonForLeaving}
              onChange={(e) => handleChange("reasonForLeaving", e.target.value)}
              options={reasonOptions}
              required
              fullWidth
            />
          </div>

          {/* End of Service Benefits */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_of_service_benefits")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.endOfServiceBenefits}
              onChange={(e) => handleChange("endOfServiceBenefits", Number(e.target.value))}
              placeholder="0.00"
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

          {/* Attachment */}
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("attachment")}
            </label>
            <FileUpload label={t("upload_attachment")} onChange={handleFileChange} accept="image/*,application/pdf" />
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
                  Remove
                </button>
              </div>
            )}
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
            {eosToEdit ? t("save") : t("add_end_of_service")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};