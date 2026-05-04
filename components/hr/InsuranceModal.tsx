import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, User, Building2, Calendar, DollarSign, Shield, Users, Hash, FileText } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Insurance } from "../../types";
import { useData } from "../../context/DataContext";

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Insurance>) => Promise<void>;
  insuranceToEdit?: Insurance | null;
  isLoading?: boolean;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  insuranceToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    policyNumber: "",
    insuranceCompany: "",
    planName: "",
    totalCost: 0,
    policyStartDate: new Date().toISOString().split("T")[0],
    policyEndDate: new Date().toISOString().split("T")[0],
    coverageExpiryDate: new Date().toISOString().split("T")[0],
    membershipId: "",
    policyPlan: "",
    familyMembers: "",
  });

  useEffect(() => {
    if (insuranceToEdit && isOpen) {
      const employeeId = typeof insuranceToEdit.employeeInfo === "object"
        ? (insuranceToEdit.employeeInfo as any)?._id
        : insuranceToEdit.employeeInfo || insuranceToEdit.employeeId;

      setFormData({
        employeeInfo: employeeId || "",
        policyNumber: insuranceToEdit.policyNumber || "",
        insuranceCompany: insuranceToEdit.insuranceCompany || "",
        planName: insuranceToEdit.planName || "",
        totalCost: insuranceToEdit.totalCost || 0,
        policyStartDate: insuranceToEdit.policyStartDate || insuranceToEdit.startDate
          ? new Date(insuranceToEdit.policyStartDate || insuranceToEdit.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        policyEndDate: insuranceToEdit.policyEndDate || insuranceToEdit.endDate
          ? new Date(insuranceToEdit.policyEndDate || insuranceToEdit.endDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        coverageExpiryDate: insuranceToEdit.coverageExpiryDate || insuranceToEdit.coverageExpiry
          ? new Date(insuranceToEdit.coverageExpiryDate || insuranceToEdit.coverageExpiry).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        membershipId: insuranceToEdit.membershipId || "",
        policyPlan: insuranceToEdit.policyPlan || "",
        familyMembers: insuranceToEdit.familyMembers || "",
      });
    } else if (!insuranceToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        policyNumber: "",
        insuranceCompany: "",
        planName: "",
        totalCost: 0,
        policyStartDate: new Date().toISOString().split("T")[0],
        policyEndDate: new Date().toISOString().split("T")[0],
        coverageExpiryDate: new Date().toISOString().split("T")[0],
        membershipId: "",
        policyPlan: "",
        familyMembers: "",
      });
    }
  }, [insuranceToEdit, isOpen]);

  const planNameOptions = [
    { value: "Bronze", label: "Bronze" },
    { value: "Silver", label: "Silver" },
    { value: "Gold", label: "Gold" },
    { value: "Platinum", label: "Platinum" },
  ];

  const policyPlanOptions = [
    { value: "Standard", label: t("standard") },
    { value: "Premium", label: t("premium") },
    { value: "Family", label: t("family") },
    { value: "Individual", label: t("individual") },
  ];

  const insuranceCompanyOptions = [
    { value: "Company X", label: "Company X" },
    { value: "Company Y", label: "Company Y" },
    { value: "Allianz", label: "Allianz" },
    { value: "AXA", label: "AXA" },
    { value: "MetLife", label: "MetLife" },
  ];

  const employeeOptions = employees.map(emp => ({
    value: emp._id || emp.id,
    label: `${emp.fullName} (${emp.employeeCode})`,
  }));

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
          {insuranceToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {insuranceToEdit ? t("edit_insurance") : t("add_insurance")}
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

          {/* Policy Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("policy_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.policyNumber}
              onChange={(e) => handleChange("policyNumber", e.target.value)}
              placeholder="POL-001"
              required
              fullWidth
            />
          </div>

          {/* Insurance Company */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("insurance_company")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.insuranceCompany}
              onChange={(e) => handleChange("insuranceCompany", e.target.value)}
              options={insuranceCompanyOptions}
              required
              fullWidth
            />
          </div>

          {/* Plan Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("plan_name")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.planName}
              onChange={(e) => handleChange("planName", e.target.value)}
              options={planNameOptions}
              required
              fullWidth
            />
          </div>

          {/* Total Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("total_cost")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.totalCost}
              onChange={(e) => handleChange("totalCost", Number(e.target.value))}
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Policy Plan */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("policy_plan")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.policyPlan}
              onChange={(e) => handleChange("policyPlan", e.target.value)}
              options={policyPlanOptions}
              required
              fullWidth
            />
          </div>

          {/* Policy Start Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("policy_start_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.policyStartDate}
              onChange={(e) => handleChange("policyStartDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Policy End Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("policy_end_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.policyEndDate}
              onChange={(e) => handleChange("policyEndDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Coverage Expiry Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("coverage_expiry")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.coverageExpiryDate}
              onChange={(e) => handleChange("coverageExpiryDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Membership ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("membership_id")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.membershipId}
              onChange={(e) => handleChange("membershipId", e.target.value)}
              placeholder="MEM-001"
              required
              fullWidth
            />
          </div>

          {/* Family Members */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("family_members")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.familyMembers}
              onChange={(e) => handleChange("familyMembers", e.target.value)}
              placeholder="3 members"
              required
              fullWidth
            />
          </div>
        </div>

        {/* Summary Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Shield size={16} className="text-blue-600" />
            {t("insurance_summary")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("policy_number")}</p>
              <p className="text-sm font-medium">{formData.policyNumber || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("plan_name")}</p>
              <p className="text-sm font-medium">{formData.planName || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_cost")}</p>
              <p className="text-sm font-bold text-blue-600">{formData.totalCost.toLocaleString()} EGP</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("coverage_expiry")}</p>
              <p className="text-sm font-medium">{formData.coverageExpiryDate || "-"}</p>
            </div>
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
            {insuranceToEdit ? t("save") : t("add_insurance")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};