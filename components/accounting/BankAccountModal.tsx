import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Building2, CreditCard, Landmark, Globe, DollarSign } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea } from "../../components/ui/Common";
import { BankAccount } from "../../types";
import { useData } from "../../context/DataContext";

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<BankAccount>) => Promise<void>;
  accountToEdit?: BankAccount | null;
  isLoading?: boolean;
}

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { currencies } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    currency: "EGP",
    balance: 0,
    isActive: true,
  });

  useEffect(() => {
    if (accountToEdit && isOpen) {
      setFormData({
        bankName: accountToEdit.bankName || "",
        accountName: accountToEdit.accountName || "",
        accountNumber: accountToEdit.accountNumber || "",
        iban: accountToEdit.iban || "",
        currency: accountToEdit.currency || "EGP",
        balance: accountToEdit.balance || 0,
        isActive: accountToEdit.isActive !== undefined ? accountToEdit.isActive : true,
      });
    } else if (!accountToEdit && isOpen) {
      setFormData({
        bankName: "",
        accountName: "",
        accountNumber: "",
        iban: "",
        currency: "EGP",
        balance: 0,
        isActive: true,
      });
    }
  }, [accountToEdit, isOpen]);

  const currencyOptions = currencies.map(c => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
  }));


  const statusOptions = [
    { value: "true", label: t("active") },
    { value: "false", label: t("inactive") },
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
          {accountToEdit ? <Edit2 size={20} /> : <Plus size={20} />}
          {accountToEdit ? t("edit_bank_account") : t("add_bank_account")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

          {/* Account Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("account_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.accountName}
              onChange={(e) => handleChange("accountName", e.target.value)}
              placeholder={t("enter_account_name")}
              required
              fullWidth
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("bank_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.bankName}
              onChange={(e) => handleChange("bankName", e.target.value)}
              placeholder={t("enter_bank_name")}
              required
              fullWidth
            />
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("account_number")} <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
              placeholder="123456789"
              required
              fullWidth
            />
          </div>

          {/* IBAN */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("iban")}
            </label>
            <Input
              value={formData.iban}
              onChange={(e) => handleChange("iban", e.target.value)}
              placeholder="SA123456789000000000"
              fullWidth
            />
          </div>

          {/* Currency */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("currency")} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
              options={currencyOptions}
              required
              fullWidth
            />
          </div>

          {/* Current Balance */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("current_balance")} (EGP) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => handleChange("currentBalance", Number(e.target.value))}
              placeholder="0.00"
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
              value={formData.isActive ? "true" : "false"}
              onChange={(e) => handleChange("isActive", e.target.value === "true")}
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
            {accountToEdit ? t("save") : t("add_bank_account")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};