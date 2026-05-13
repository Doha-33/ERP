import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Briefcase, Building2, FileText, Hash } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Job } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

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

  // Generate job code
  const generateJobCode = useCallback(() => {
    const timestamp = Date.now().toString().slice(-6);
    return `JOB-${timestamp}`;
  }, []);

  useEffect(() => {
    if (jobToEdit && isOpen) {
      const departmentId = extractId(jobToEdit.departmentId);

      setFormData({
        departmentId: departmentId || "",
        jobName: jobToEdit.jobName || "",
        description: jobToEdit.description || "",
        state: jobToEdit.state || "ACTIVE",
      });
    } else if (!jobToEdit && isOpen) {
      const defaultDepartmentId = departments.length > 0 ? extractId(departments[0]) : "";
      setFormData({
        departmentId: defaultDepartmentId,
        jobName: "",
        description: "",
        state: "ACTIVE",
      });
    }
  }, [jobToEdit, isOpen, departments, extractId]);

  const departmentOptions = departments.map(d => ({
    value: extractId(d),
    label: d.departmentName,
  }));

  const statusOptions = [
    { value: "ACTIVE", label: t("active") },
    { value: "INACTIVE", label: t("inactive") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.departmentId) {
      toast.error(t("department_required"));
      return;
    }
    if (!formData.jobName.trim()) {
      toast.error(t("job_name_required"));
      return;
    }
    if (!formData.description.trim()) {
      toast.error(t("description_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: any = {
        departmentId: formData.departmentId,
        jobName: formData.jobName,
        description: formData.description,
        state: formData.state,
      };
      
      // Add code for new job
      if (!jobToEdit) {
        saveData.code = generateJobCode();
      }
      
      console.log("Saving job:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_job"));
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
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.departmentId}
                onChange={(e) => handleChange("departmentId", e.target.value)}
                options={departmentOptions}
                placeholder={t("select_department")}
                required
                fullWidth
                className="pl-10"
                disabled={!!jobToEdit}
              />
            </div>
          </div>

          {/* Job Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("job_name")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.jobName}
                onChange={(e) => handleChange("jobName", e.target.value)}
                placeholder={t("enter_job_name")}
                required
                fullWidth
                className="pl-10"
              />
            </div>
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
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder={t("enter_job_description")}
                rows={4}
                required
                fullWidth
                className="pl-10"
              />
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
            {jobToEdit ? t("update_job") : t("add_job")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};