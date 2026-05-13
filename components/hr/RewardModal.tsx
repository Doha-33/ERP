import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  User,
  Calendar,
  DollarSign,
  Award,
  Gift,
  Star,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { Reward } from "../../types";
import { useData } from "../../context/DataContext";

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Reward>) => Promise<void>;
  rewardToEdit?: Reward | null;
  isLoading?: boolean;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rewardToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { employees } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeInfo: "",
    rewardsType: "Performance Bonus",
    rewardDate: new Date().toISOString().split("T")[0],
    rewardAmount: 0,
    bonus: 0,
    commissions: 0,
    notes: "",
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
    if (rewardToEdit && isOpen) {
      const employeeId = extractId(rewardToEdit.employeeInfo);

      setFormData({
        employeeInfo: employeeId || "",
        rewardsType:
          rewardToEdit.rewardsType ||
          rewardToEdit.rewardType ||
          "Performance Bonus",
        rewardDate:
          rewardToEdit.rewardDate || rewardToEdit.date
            ? new Date(rewardToEdit.rewardDate || rewardToEdit.date)
                .toISOString()
                .split("T")[0]
            : new Date().toISOString().split("T")[0],
        rewardAmount: rewardToEdit.rewardAmount || rewardToEdit.amount || 0,
        bonus: rewardToEdit.bonus || rewardToEdit.bonusAmount || 0,
        commissions:
          rewardToEdit.commissions || rewardToEdit.commissionAmount || 0,
        notes: rewardToEdit.notes || "",
      });
    } else if (!rewardToEdit && isOpen) {
      setFormData({
        employeeInfo: "",
        rewardsType: "Performance Bonus",
        rewardDate: new Date().toISOString().split("T")[0],
        rewardAmount: 0,
        bonus: 0,
        commissions: 0,
        notes: "",
      });
    }
  }, [rewardToEdit, isOpen, extractId]);

  const rewardTypeOptions = [
    { value: "Performance Bonus", label: t("performance_bonus"), icon: Star },
    { value: "Spot Reward", label: t("spot_reward"), icon: Award },
    { value: "Incentive Scheme", label: t("incentive_scheme"), icon: Gift },
    { value: "Annual Bonus", label: t("annual_bonus"), icon: Award },
    { value: "Other", label: t("other"), icon: Star },
  ];

  const employeeOptions = employees.map((emp) => ({
    value: extractId(emp),
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalAmount =
    (formData.rewardAmount || 0) +
    (formData.bonus || 0) +
    (formData.commissions || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {rewardToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {rewardToEdit ? t("edit_reward") : t("add_reward")}
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

          {/* Reward Type */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reward_type")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.rewardsType}
              onChange={(e) => handleChange("rewardsType", e.target.value)}
              options={rewardTypeOptions}
              required
              fullWidth
            />
          </div>

          {/* Reward Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reward_date")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.rewardDate}
              onChange={(e) => handleChange("rewardDate", e.target.value)}
              required
              fullWidth
            />
          </div>

          {/* Reward Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("reward_amount")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.rewardAmount}
              onChange={(e) =>
                handleChange("rewardAmount", Number(e.target.value))
              }
              placeholder="0.00"
              required
              fullWidth
            />
          </div>

          {/* Bonus */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bonus")} (EGP)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.bonus}
              onChange={(e) => handleChange("bonus", Number(e.target.value))}
              placeholder="0.00"
              fullWidth
            />
          </div>

          {/* Commissions */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("commissions")} (EGP)
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.commissions}
              onChange={(e) =>
                handleChange("commissions", Number(e.target.value))
              }
              placeholder="0.00"
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
        </div>

        {/* Summary Preview */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Award size={16} className="text-green-600" />
            {t("reward_summary")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">{t("reward_amount")}</p>
              <p className="text-sm font-bold text-green-600">
                {formData.rewardAmount.toLocaleString()} EGP
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("bonus")}</p>
              <p className="text-sm font-bold text-blue-600">
                {formData.bonus.toLocaleString()} EGP
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("commissions")}</p>
              <p className="text-sm font-bold text-purple-600">
                {formData.commissions.toLocaleString()} EGP
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_reward")}</p>
              <p className="text-lg font-bold text-emerald-600">
                {totalAmount.toLocaleString()} EGP
              </p>
            </div>
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
            {rewardToEdit ? t("save") : t("add_reward")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
