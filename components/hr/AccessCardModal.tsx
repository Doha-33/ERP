import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, CreditCard, User, Calendar, UserCheck, Shield, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { AccessCard, Employee } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface AccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<AccessCard>) => Promise<void>;
  cardToEdit?: AccessCard | null;
  isLoading?: boolean;
}

export const AccessCardModal: React.FC<AccessCardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  cardToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    cardNumber: "",
    doneAt: new Date().toISOString().split("T")[0],
    doneBy: "",
    status: "Pending",
  });

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

  // Generate card number
  const generateCardNumber = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CARD-${timestamp}`;
  }, []);

  useEffect(() => {
    if (cardToEdit && isOpen) {
      // Handle employeeInfo mapping
      let employeeId = "";
      if (cardToEdit.employeeInfo) {
        if (typeof cardToEdit.employeeInfo === "object") {
          employeeId = extractId(cardToEdit.employeeInfo);
        } else {
          employeeId = cardToEdit.employeeInfo;
        }
      } else if (cardToEdit.employeeId) {
        if (typeof cardToEdit.employeeId === "object") {
          employeeId = extractId(cardToEdit.employeeId);
        } else {
          employeeId = cardToEdit.employeeId;
        }
      }

      // Handle doneAt date
      let doneAtDate = new Date().toISOString().split("T")[0];
      if (cardToEdit.doneAt) {
        doneAtDate = new Date(cardToEdit.doneAt).toISOString().split("T")[0];
      } else if (cardToEdit.issueDate) {
        doneAtDate = new Date(cardToEdit.issueDate).toISOString().split("T")[0];
      }

      // Handle doneBy
      let doneByName = cardToEdit.doneBy || "";
      if (!doneByName && cardToEdit.accessLevel) {
        doneByName = cardToEdit.accessLevel;
      }

      // Handle status
      let status = cardToEdit.status || "Pending";
      if (status === "Active") status = "Done";

      setFormData({
        employeeInfo: employeeId,
        cardNumber: cardToEdit.cardNumber || "",
        doneAt: doneAtDate,
        doneBy: doneByName,
        status: status,
      });
    } else if (!cardToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        cardNumber: generateCardNumber(),
        doneAt: new Date().toISOString().split("T")[0],
        doneBy: "",
        status: "Pending",
      });
    }
  }, [cardToEdit, isOpen, extractId, generateCardNumber]);

  const employeeOptions = employees.map(emp => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Done", label: t("done") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeInfo) {
      toast.error(t("employee_required"));
      return;
    }
    if (!formData.cardNumber.trim()) {
      toast.error(t("card_number_required"));
      return;
    }
    if (!formData.doneAt) {
      toast.error(t("issue_date_required"));
      return;
    }
    if (!formData.doneBy.trim()) {
      toast.error(t("issued_by_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find selected employee to get employee code
      const selectedEmp = employees.find(emp => extractId(emp) === formData.employeeInfo);
      
      const saveData: any = {
        employeeInfo: formData.employeeInfo,
        cardNumber: formData.cardNumber,
        doneAt: formData.doneAt,
        doneBy: formData.doneBy,
        status: formData.status,
        empCode: selectedEmp?.employeeCode || "",
      };
      
      // If editing, include the ID
      if (cardToEdit) {
        const cardId = extractId(cardToEdit);
        if (cardId) {
          saveData._id = cardId;
          saveData.id = cardId;
        }
      }
      
      console.log("Saving access card:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_access_card"));
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
          {cardToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          <span className="text-lg font-semibold text-gray-900">
            {cardToEdit ? t("edit_access_card") : t("add_access_card")}
          </span>
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee Selection */}
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
                disabled={!!cardToEdit}
              />
            </div>
          </div>

          {/* Card Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("card_number")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.cardNumber}
                onChange={(e) => handleChange("cardNumber", e.target.value)}
                placeholder="CARD-001"
                required
                fullWidth
                className="pl-10"
                disabled={!!cardToEdit}
              />
            </div>
          </div>

          {/* Issue Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("issue_date")} <span className="text-red-500">*</span>
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

          {/* Issued By */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("issued_by")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.doneBy}
                onChange={(e) => handleChange("doneBy", e.target.value)}
                placeholder={t("enter_issued_by")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
            <p className="text-xs text-gray-500">{t("status_description")}</p>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("card_summary")}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("card_number")}</p>
              <p className="text-sm font-mono font-medium">{formData.cardNumber || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("issue_date")}</p>
              <p className="text-sm font-medium">{formData.doneAt || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("issued_by")}</p>
              <p className="text-sm font-medium">{formData.doneBy || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("status")}</p>
              <Badge variant={formData.status === "Done" ? "success" : "warning"}>
                {formData.status === "Done" ? t("done") : t("pending")}
              </Badge>
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
            {cardToEdit ? t("update_access_card") : t("add_access_card")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add missing imports
import { Badge } from "../../components/ui/Common";