import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  FileText,
  Upload,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import {
  Button,
  Input,
  Select,
  TextArea,
  FileUpload,
} from "../../components/ui/Common";
import { Penalty } from "../../types";
import { useData } from "../../context/DataContext";

interface PenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Penalty>) => Promise<void>;
  penaltyToEdit?: Penalty | null;
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
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.5));
    };
    img.onerror = () => resolve(base64Str);
  });
};

export const PenaltyModal: React.FC<PenaltyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  penaltyToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [formData, setFormData] = useState({
    employeeInfo: "",
    penaltyType: "",
    penaltyAmount: 0,
    date: new Date().toISOString().split("T")[0],
    decisionMaker: "",
    status: "Pending",
    reason: "",
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

  useEffect(() => {
    if (penaltyToEdit && isOpen) {
      const employeeId = extractId(penaltyToEdit.employeeInfo);
      const decisionMakerId = extractId(penaltyToEdit.decisionMaker);

      setFormData({
        employeeInfo: employeeId || "",
        penaltyType: penaltyToEdit.penaltyType || "",
        penaltyAmount: penaltyToEdit.penaltyAmount || penaltyToEdit.amount || 0,
        date: penaltyToEdit.date
          ? new Date(penaltyToEdit.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        decisionMaker: decisionMakerId || "",
        status: penaltyToEdit.status || "Pending",
        reason: penaltyToEdit.reason || "",
      });
      setAttachment(penaltyToEdit.attachment);
    } else if (!penaltyToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        penaltyType: "",
        penaltyAmount: 0,
        date: new Date().toISOString().split("T")[0],
        decisionMaker: "",
        status: "Pending",
        reason: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [penaltyToEdit, isOpen, extractId]);

  const penaltyTypeOptions = [
    { value: "Late Arrival", label: t("late_arrival") },
    { value: "Absence", label: t("absence") },
    { value: "Misconduct", label: t("misconduct") },
    { value: "Violation", label: t("violation") },
    { value: "Other", label: t("other") },
  ];
  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

  const employeeOptions = employees.map((emp) => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const decisionMakerOptions = [
    { value: "", label: t("none") },
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {penaltyToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {penaltyToEdit ? t("edit_penalty") : t("add_penalty")}
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

          {/* Penalty Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("penalty_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.penaltyType}
              onChange={(e) => handleChange("penaltyType", e.target.value)}
              options={penaltyTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Penalty Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("penalty_amount")} (EGP){" "}
              <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.penaltyAmount}
              onChange={(e) =>
                handleChange("penaltyAmount", Number(e.target.value))
              }
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Decision Maker */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("decision_maker")}
            </label>
            <Select
              value={formData.decisionMaker}
              onChange={(e) => handleChange("decisionMaker", e.target.value)}
              options={decisionMakerOptions}
              placeholder={t("select_decision_maker")}
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

          {/* Attachment */}
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("attachment")}
            </label>
            <FileUpload
              label={t("upload_attachment")}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
            />
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
                  {t("remove")}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting || isLoading}
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
            {penaltyToEdit ? t("save") : t("add_penalty")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
