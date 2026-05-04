import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Briefcase, Building2, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Job } from "../../types";
import { useData } from "../../context/DataContext";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Job>) => Promise<void>;
  jobToEdit?: Job | null;
  isLoading?: boolean;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  jobToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { departments } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    departmentId: "",
    jobName: "",
    description: "",
    state: "ACTIVE",
  });

  useEffect(() => {
    if (jobToEdit && isOpen) {
      const departmentId = typeof jobToEdit.departmentId === "object"
        ? (jobToEdit.departmentId as any)?._id
        : jobToEdit.departmentId;

      setFormData({
        departmentId: departmentId || "",
        jobName: jobToEdit.jobName || "",
        description: jobToEdit.description || "",
        state: jobToEdit.state || "ACTIVE",
      });
    } else if (!jobToEdit && isOpen) {
      const defaultDepartmentId = departments.length > 0 ? (departments[0]._id || departments[0].id) : "";
      setFormData({
        departmentId: defaultDepartmentId,
        jobName: "",
        description: "",
        state: "ACTIVE",
      });
    }
  }, [jobToEdit, isOpen, departments]);

  const departmentOptions = departments.map(d => ({
    value: d._id || d.id,
    label: d.departmentName,
  }));

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
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
          {jobToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {jobToEdit ? t("edit_job") : t("add_job")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Department */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.departmentId}
              onChange={(e) => handleChange("departmentId", e.target.value)}
              options={departmentOptions}
              placeholder={t("select_department")}
              required
              fullWidth
            />
          </div>

          {/* Job Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("job_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.jobName}
              onChange={(e) => handleChange("jobName", e.target.value)}
              placeholder={t("enter_job_name")}
              required
              fullWidth
            />
          </div>

          {/* Status (only for edit) */}
          {jobToEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("status")} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                options={statusOptions}
                required
                fullWidth
              />
            </div>
          )}

          {/* Description */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("description")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={t("enter_job_description")}
              rows={4}
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
            {jobToEdit ? t("save") : t("add_job")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};