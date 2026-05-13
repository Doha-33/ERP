import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  User,
  Calendar,
  BookOpen,
  Users,
  Award,
  Clock,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { InitialTraining } from "../../types";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

interface InitialTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<InitialTraining>) => Promise<void>;
  trainingToEdit?: InitialTraining | null;
  isLoading?: boolean;
}

export const InitialTrainingModal: React.FC<InitialTrainingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trainingToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { employees, departments } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    trainingType: "",
    trainer: "",
    department: "",
    doneBy: "",
    doneAt: new Date().toISOString().split("T")[0],
    status: "Pending",
    notes: "",
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
    if (trainingToEdit && isOpen) {
      const employeeId = extractId(trainingToEdit.employeeInfo);
      const departmentId = extractId(trainingToEdit.department);

      setFormData({
        employeeInfo: employeeId || "",
        trainingType:
          trainingToEdit.trainingType || trainingToEdit.trainingName || "",
        trainer: trainingToEdit.trainer || "",
        department: departmentId || "",
        doneBy: trainingToEdit.doneBy || "",
        doneAt:
          trainingToEdit.doneAt || trainingToEdit.trainingDate
            ? new Date(trainingToEdit.doneAt || trainingToEdit.trainingDate)
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0],
        status: trainingToEdit.status || "Pending",
        notes: trainingToEdit.notes || "",
      });
    } else if (!trainingToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        trainingType: "",
        trainer: "",
        department: "",
        doneBy: isAdmin ? "" : user?.username || "",
        doneAt: new Date().toISOString().split("T")[0],
        status: "Pending",
        notes: "",
      });
    }
  }, [trainingToEdit, isOpen, isAdmin, user, extractId]);

  const trainingTypeOptions = [
    { value: "Safety Training", label: t("safety_training"), icon: Award },
    {
      value: "Technical Training",
      label: t("technical_training"),
      icon: BookOpen,
    },
    { value: "Soft Skills", label: t("soft_skills"), icon: Users },
    {
      value: "Compliance Training",
      label: t("compliance_training"),
      icon: Award,
    },
    { value: "Onboarding", label: t("onboarding"), icon: BookOpen },
  ];

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Done", label: t("done") },
    { value: "Canceled", label: t("canceled") },
    { value: "Paid", label: t("paid") },
    { value: "Unpaid", label: t("unpaid") },
  ];

  const employeeOptions = employees.map((emp) => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const departmentOptions = departments.map((dept) => ({
    value: extractId(dept),
    label: dept.departmentName,
  }));
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get selected employee for empCode
      const selectedEmployee = employees.find(
        (e) => (e._id || e.id) === formData.employeeInfo,
      );

      await onSave({
        ...formData,
        empCode: selectedEmployee?.employeeCode || "",
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
          {trainingToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {trainingToEdit
            ? t("edit_initial_training")
            : t("add_initial_training")}
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

          {/* Training Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("training_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.trainingType}
              onChange={(e) => handleChange("trainingType", e.target.value)}
              options={trainingTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Trainer */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("trainer")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.trainer}
              onChange={(e) => handleChange("trainer", e.target.value)}
              placeholder={t("enter_trainer_name")}
              required
              fullWidth
            />
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              options={departmentOptions}
              placeholder={t("select_department")}
              required
              fullWidth
            />
          </div>

          {/* Done By */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("done_by")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.doneBy}
              onChange={(e) => handleChange("doneBy", e.target.value)}
              placeholder={t("enter_done_by")}
              required
              fullWidth
            />
          </div>

          {/* Done At */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("done_at")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.doneAt}
              onChange={(e) => handleChange("doneAt", e.target.value)}
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
            {trainingToEdit ? t("save") : t("add_initial_training")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
