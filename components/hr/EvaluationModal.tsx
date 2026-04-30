import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Star, Edit2, Plus, TrendingUp } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Evaluation, Employee } from "../../types";
import { useData } from "../../context/DataContext";

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Evaluation>) => Promise<void>;
  evaluationToEdit?: Evaluation | null;
  isLoading?: boolean;
}

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  evaluationToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    period: "",
    evaluationScore: 0,
    attendance: 0,
    productivity: 0,
    teamwork: 0,
    communication: 0,
    skillDevelopment: 0,
    status: "COMPLETED",
    notes: "",
  });

  // Calculate average score when individual scores change
  useEffect(() => {
    const scores = [
      formData.attendance,
      formData.productivity,
      formData.teamwork,
      formData.communication,
      formData.skillDevelopment,
    ];
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    setFormData(prev => ({ ...prev, evaluationScore: Math.round(average) }));
  }, [formData.attendance, formData.productivity, formData.teamwork, formData.communication, formData.skillDevelopment]);

  useEffect(() => {
    if (evaluationToEdit && isOpen) {
      const employeeId = typeof evaluationToEdit.employeeId === "object"
        ? (evaluationToEdit.employeeId as any)._id
        : evaluationToEdit.employeeId;

      setFormData({
        employeeId: employeeId || "",
        period: evaluationToEdit.period || `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`,
        evaluationScore: evaluationToEdit.evaluationScore || 0,
        attendance: evaluationToEdit.attendance || 0,
        productivity: evaluationToEdit.productivity || 0,
        teamwork: evaluationToEdit.teamwork || 0,
        communication: evaluationToEdit.communication || 0,
        skillDevelopment: evaluationToEdit.skillDevelopment || 0,
        status: evaluationToEdit.status || "COMPLETED",
        notes: evaluationToEdit.notes || "",
      });
    } else if (!evaluationToEdit && isOpen) {
      const currentYear = new Date().getFullYear();
      const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
      setFormData({
        employeeId: "",
        period: `${currentYear}-Q${currentQuarter}`,
        evaluationScore: 0,
        attendance: 0,
        productivity: 0,
        teamwork: 0,
        communication: 0,
        skillDevelopment: 0,
        status: "COMPLETED",
        notes: "",
      });
    }
  }, [evaluationToEdit, isOpen]);

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const periodOptions = [
    { value: `${new Date().getFullYear()}-Q1`, label: `Q1 ${new Date().getFullYear()}` },
    { value: `${new Date().getFullYear()}-Q2`, label: `Q2 ${new Date().getFullYear()}` },
    { value: `${new Date().getFullYear()}-Q3`, label: `Q3 ${new Date().getFullYear()}` },
    { value: `${new Date().getFullYear()}-Q4`, label: `Q4 ${new Date().getFullYear()}` },
    { value: `${new Date().getFullYear() - 1}-Q1`, label: `Q1 ${new Date().getFullYear() - 1}` },
    { value: `${new Date().getFullYear() - 1}-Q2`, label: `Q2 ${new Date().getFullYear() - 1}` },
    { value: `${new Date().getFullYear() - 1}-Q3`, label: `Q3 ${new Date().getFullYear() - 1}` },
    { value: `${new Date().getFullYear() - 1}-Q4`, label: `Q4 ${new Date().getFullYear() - 1}` },
  ];

  const statusOptions = [
    { value: "COMPLETED", label: t("completed") },
    { value: "APPROVED", label: t("approved") },
    { value: "DRAFT", label: t("draft") },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

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
          {evaluationToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {evaluationToEdit ? t("edit_evaluation") : t("add_evaluation")}
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

          {/* Period */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("period")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.period}
              onChange={(e) => handleChange("period", e.target.value)}
              options={periodOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" />
            {t("performance_metrics")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            <Input
              label={t("attendance")}
              type="number"
              min="0"
              max="100"
              value={formData.attendance}
              onChange={(e) => handleChange("attendance", Number(e.target.value))}
              fullWidth
            />
            <Input
              label={t("productivity")}
              type="number"
              min="0"
              max="100"
              value={formData.productivity}
              onChange={(e) => handleChange("productivity", Number(e.target.value))}
              fullWidth
            />
            <Input
              label={t("teamwork")}
              type="number"
              min="0"
              max="100"
              value={formData.teamwork}
              onChange={(e) => handleChange("teamwork", Number(e.target.value))}
              fullWidth
            />
            <Input
              label={t("communication")}
              type="number"
              min="0"
              max="100"
              value={formData.communication}
              onChange={(e) => handleChange("communication", Number(e.target.value))}
              fullWidth
            />
            <Input
              label={t("skill_development")}
              type="number"
              min="0"
              max="100"
              value={formData.skillDevelopment}
              onChange={(e) => handleChange("skillDevelopment", Number(e.target.value))}
              fullWidth
            />
          </div>
        </div>

        {/* Overall Score Display */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-base font-semibold text-gray-700">{t("overall_score")}</span>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    formData.evaluationScore >= 80 ? "bg-green-500" : formData.evaluationScore >= 60 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${formData.evaluationScore}%` }}
                />
              </div>
              <span className={`text-2xl font-bold ${getScoreColor(formData.evaluationScore)}`}>
                {formData.evaluationScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Status & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <Select
            label={t("status")}
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
            options={statusOptions}
            fullWidth
          />
          <TextArea
            label={t("notes")}
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder={t("enter_notes")}
            rows={2}
            fullWidth
          />
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
            {evaluationToEdit ? t("save") : t("add_evaluation")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};