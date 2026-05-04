import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, CreditCard, User, Calendar, UserCheck, Shield } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { AccessCard, Employee } from "../../types";
import { useData } from "../../context/DataContext";

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

  useEffect(() => {
    if (cardToEdit && isOpen) {
      // Handle employeeInfo mapping
      let employeeId = "";
      if (typeof cardToEdit.employeeInfo === "object" && cardToEdit.employeeInfo !== null) {
        employeeId = (cardToEdit.employeeInfo as any)._id || (cardToEdit.employeeInfo as any).id || "";
      } else if (typeof cardToEdit.employeeInfo === "string") {
        employeeId = cardToEdit.employeeInfo;
      } else if (cardToEdit.employeeId) {
        employeeId = cardToEdit.employeeId;
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
        cardNumber: "",
        doneAt: new Date().toISOString().split("T")[0],
        doneBy: "",
        status: "Pending",
      });
    }
  }, [cardToEdit, isOpen]);

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Done", label: t("done") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Find selected employee to get employee code
      const selectedEmp = employees.find(emp => (emp._id || emp.id) === formData.employeeInfo);
      
      await onSave({
        employeeInfo: formData.employeeInfo,
        cardNumber: formData.cardNumber,
        doneAt: formData.doneAt,
        doneBy: formData.doneBy,
        status: formData.status,
        empCode: selectedEmp?.employeeCode || "",
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
          {cardToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          <span className="text-lg font-semibold text-gray-900">
            {cardToEdit ? t("edit_access_card") : t("add_access_card")}
          </span>
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee Selection */}
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

          {/* Card Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("card_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.cardNumber}
              onChange={(e) => handleChange("cardNumber", e.target.value)}
              placeholder="CARD-001"
              required
              fullWidth
            />
          </div>

          {/* Done Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("issue_date")} <span className="text-red-500">*</span>
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
              {t("issued_by")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.doneBy}
              onChange={(e) => handleChange("doneBy", e.target.value)}
              placeholder={t("enter_issued_by")}
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
            {cardToEdit ? t("save") : t("add_access_card")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};