import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Calendar, FileText, DollarSign, AlertCircle, Building2, Briefcase } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { EndOfService } from "../../types";
import { useData } from "../../context/DataContext";
import { toast } from "sonner";

interface EndOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<EndOfService>) => Promise<void>;
  eosToEdit?: EndOfService | null;
  isLoading?: boolean;
}

export const EndOfServiceModal: React.FC<EndOfServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  eosToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees, departments, companies, branches, jobs } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [attachmentName, setAttachmentName] = useState<string>("");
  const [formData, setFormData] = useState({
    employeeInfo: "",
    eosType: "Resignation",
    lastWorkingDay: new Date().toISOString().split("T")[0],
    reason: "",
    endOfServiceBenefits: 0,
    status: "Pending",
    notes: "",
    jobTitle: "",
    department: "",
    companyId: "",
    branchId: "",
    startDate: "",
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

  useEffect(() => {
    if (eosToEdit && isOpen) {
      // Extract employee ID from various possible fields
      let employeeId = "";
      if (eosToEdit.employeeInfo) {
        employeeId = extractId(eosToEdit.employeeInfo);
      } else if (eosToEdit.employeeId) {
        employeeId = extractId(eosToEdit.employeeId);
      }
      
      // Extract department ID
      let departmentId = "";
      if (eosToEdit.department) {
        departmentId = extractId(eosToEdit.department);
      }
      
      // Extract company ID
      let companyId = "";
      if (eosToEdit.companyId) {
        companyId = extractId(eosToEdit.companyId);
      }
      
      // Extract branch ID
      let branchId = "";
      if (eosToEdit.branchId) {
        branchId = extractId(eosToEdit.branchId);
      }

      setFormData({
        employeeInfo: employeeId || "",
        eosType: eosToEdit.eosType || eosToEdit.reasonForLeaving || "Resignation",
        lastWorkingDay: eosToEdit.lastWorkingDay
          ? new Date(eosToEdit.lastWorkingDay).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        reason: eosToEdit.reason || eosToEdit.reasonForLeaving || "",
        endOfServiceBenefits: eosToEdit.endOfServiceBenefits || 0,
        status: eosToEdit.status || "Pending",
        notes: eosToEdit.notes || "",
        jobTitle: eosToEdit.jobTitle || "",
        department: departmentId || "",
        companyId: companyId || "",
        branchId: branchId || "",
        startDate: eosToEdit.startDate
          ? new Date(eosToEdit.startDate).toISOString().split("T")[0]
          : "",
      });
      setAttachment(eosToEdit.attachment);
    } else if (!eosToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        eosType: "Resignation",
        lastWorkingDay: new Date().toISOString().split("T")[0],
        reason: "",
        endOfServiceBenefits: 0,
        status: "Pending",
        notes: "",
        jobTitle: "",
        department: "",
        companyId: "",
        branchId: "",
        startDate: "",
      });
      setAttachment(undefined);
      setAttachmentName("");
    }
  }, [eosToEdit, isOpen, extractId]);

  // Auto-fill employee details when employee is selected
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => extractId(e) === employeeId);
    if (employee) {
      const companyId = extractId(employee.companyId);
      const branchId = extractId(employee.branchId);
      const departmentId = extractId(employee.departmentId);
      const jobTitle = employee.jobId?.jobName || "";
      const hireDate = employee.hireDate ? new Date(employee.hireDate).toISOString().split("T")[0] : "";
      
      setFormData(prev => ({
        ...prev,
        employeeInfo: employeeId,
        companyId: companyId || "",
        branchId: branchId || "",
        department: departmentId || "",
        jobTitle: jobTitle,
        startDate: hireDate,
      }));
    } else {
      setFormData(prev => ({ ...prev, employeeInfo: employeeId }));
    }
  };

  // API expects: Resignation, End Contract, Termination, Retirement, Other
  const eosTypeOptions = [
    { value: "Resignation", label: t("resignation") },
    { value: "End Contract", label: t("end_contract") },
    { value: "Termination", label: t("termination") },
    { value: "Retirement", label: t("retirement") },
    { value: "Other", label: t("other") },
  ];

  const statusOptions = [
    { value: "Pending", label: t("pending") },
    { value: "Approved", label: t("approved") },
    { value: "Rejected", label: t("rejected") },
  ];

  const employeeOptions = employees.map(emp => ({
    value: extractId(emp),
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

  const departmentOptions = departments.map(dept => ({
    value: extractId(dept),
    label: dept.departmentName,
  }));

  const companyOptions = companies.map(c => ({
    value: extractId(c),
    label: c.name,
  }));

  const branchOptions = branches.map(b => ({
    value: extractId(b),
    label: b.name,
  }));

  const jobOptions = jobs.map(j => ({
    value: extractId(j),
    label: j.jobName,
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
    
    // Validation
    if (!formData.employeeInfo) {
      toast.error(t("employee_required"));
      return;
    }
    if (!formData.eosType) {
      toast.error(t("eos_type_required"));
      return;
    }
    if (!formData.lastWorkingDay) {
      toast.error(t("last_working_day_required"));
      return;
    }
    if (!formData.reason.trim()) {
      toast.error(t("reason_required"));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const saveData: any = {
        employeeInfo: formData.employeeInfo,
        eosType: formData.eosType,
        lastWorkingDay: formData.lastWorkingDay,
        reason: formData.reason,
        endOfServiceBenefits: formData.endOfServiceBenefits,
        status: formData.status,
        notes: formData.notes || undefined,
        jobTitle: formData.jobTitle,
        department: formData.department,
        companyId: formData.companyId,
        branchId: formData.branchId,
        startDate: formData.startDate,
        attachment: attachment,
      };
      
      // If editing, include the ID
      if (eosToEdit) {
        const eosId = extractId(eosToEdit);
        if (eosId) {
          saveData._id = eosId;
          saveData.id = eosId;
        }
      }
      
      console.log("Saving end of service:", saveData);
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast.error(t("failed_to_save_end_of_service"));
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
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Employee */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("employee")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.employeeInfo}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                options={employeeOptions}
                placeholder={t("select_employee")}
                required
                fullWidth
                className="pl-10"
                disabled={!!eosToEdit}
              />
            </div>
          </div>

          {/* EOS Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("eos_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.eosType}
              onChange={(e) => handleChange("eosType", e.target.value)}
              options={eosTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Last Working Day */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("last_working_day")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.lastWorkingDay}
                onChange={(e) => handleChange("lastWorkingDay", e.target.value)}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Start Date (hire date) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("start_date")}
            </label>
            <div className="relative">
              <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                fullWidth
                className="pl-10"
                disabled
              />
            </div>
          </div>

          {/* Job Title */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("job_title")}
            </label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.jobTitle}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                placeholder={t("enter_job_title")}
                fullWidth
                className="pl-10"
                disabled
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("department")}
            </label>
            <div className="relative">
              <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Select
                value={formData.department}
                onChange={(e) => handleChange("department", e.target.value)}
                options={departmentOptions}
                placeholder={t("select_department")}
                fullWidth
                className="pl-10"
                disabled
              />
            </div>
          </div>

          {/* Reason */}
          <div className="col-span-2 space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reason")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <AlertCircle size={18} className="absolute left-3 top-3 text-gray-400" />
              <TextArea
                value={formData.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                placeholder={t("enter_reason")}
                rows={3}
                required
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* End of Service Benefits */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("end_of_service_benefits")} (EGP)
            </label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.endOfServiceBenefits}
                onChange={(e) => handleChange("endOfServiceBenefits", Number(e.target.value))}
                placeholder="0.00"
                fullWidth
                className="pl-10"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")}
            </label>
            <Select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
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
              rows={2}
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
            {eosToEdit ? t("update_end_of_service") : t("add_end_of_service")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Add compressImage function
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