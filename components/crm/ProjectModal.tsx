import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Calendar, User, Briefcase, Target, Clock, CheckCircle, XCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { CRMProject } from "../../types";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<CRMProject>) => Promise<void>;
  projectToEdit?: CRMProject | null;
  isLoading?: boolean;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    teamLeader: "",
    client: "",
    progress: 0,
    startDate: "",
    deadline: "",
    status: "In Progress",
  });

  useEffect(() => {
    if (projectToEdit && isOpen) {
      setFormData({
        projectName: projectToEdit.projectName || "",
        teamLeader: projectToEdit.teamLeader || "",
        client: projectToEdit.client || "",
        progress: projectToEdit.progress || 0,
        startDate: projectToEdit.startDate ? new Date(projectToEdit.startDate).toISOString().split("T")[0] : "",
        deadline: projectToEdit.deadline ? new Date(projectToEdit.deadline).toISOString().split("T")[0] : "",
        status: projectToEdit.status || "In Progress",
      });
    } else if (!projectToEdit && isOpen) {
      setFormData({
        projectName: "",
        teamLeader: "",
        client: "",
        progress: 0,
        startDate: "",
        deadline: "",
        status: "In Progress",
      });
    }
  }, [projectToEdit, isOpen]);

  const statusOptions = [
    { value: "In Progress", label: t("in_progress"), icon: Clock },
    { value: "Completed", label: t("completed"), icon: CheckCircle },
    { value: "Cancelled", label: t("cancelled"), icon: XCircle },
  ];

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
          {projectToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {projectToEdit ? t("edit_project") : t("add_project")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Project Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("project_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.projectName}
              onChange={(e) => handleChange("projectName", e.target.value)}
              placeholder={t("enter_project_name")}
              required
              fullWidth
            />
          </div>

          {/* Client */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("client")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.client}
              onChange={(e) => handleChange("client", e.target.value)}
              placeholder={t("enter_client_name")}
              required
              fullWidth
            />
          </div>

          {/* Team Leader */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("team_leader")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.teamLeader}
              onChange={(e) => handleChange("teamLeader", e.target.value)}
              placeholder={t("enter_team_leader")}
              required
              fullWidth
            />
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("progress")} (%) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => handleChange("progress", Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("deadline")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
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
            {projectToEdit ? t("save") : t("add_project")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};