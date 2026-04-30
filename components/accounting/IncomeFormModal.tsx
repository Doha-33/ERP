// src/components/accounting/IncomeFormModal.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, CreditCard, Paperclip, Link as LinkIcon, X, Trash2, Eye, Upload, Link, Percent } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { Income as IncomeType } from "../../types";
import { toast } from "sonner";

interface IncomeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIncome: IncomeType | null;
  onSave: (data: Partial<IncomeType>) => Promise<void>;
}

export const IncomeFormModal: React.FC<IncomeFormModalProps> = ({
  isOpen,
  onClose,
  selectedIncome,
  onSave,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(selectedIncome?.amount || 0);
  const [vatPercent, setVatPercent] = useState<number>(selectedIncome?.vatPercent || 0);
  const [vatAmount, setVatAmount] = useState<number>(selectedIncome?.vatAmount || 0);
  const [totalWithVat, setTotalWithVat] = useState<number>(selectedIncome?.amount || 0);

  // Calculate VAT amount and total when amount or VAT percent changes
  useEffect(() => {
    const calculatedVatAmount = (amount * vatPercent) / 100;
    setVatAmount(calculatedVatAmount);
    setTotalWithVat(amount + calculatedVatAmount);
  }, [amount, vatPercent]);

  // Source Options
  const sourceOptions = [
    { value: "Freelance", label: t("freelance") },
    { value: "Salary", label: t("salary") },
    { value: "Investment", label: t("investment") },
    { value: "Business", label: t("business") },
    { value: "Rental", label: t("rental") },
    { value: "Other", label: t("other_income") },
  ];

  // Payment Method Options
  const paymentMethodOptions = [
    { value: "Bank Transfer", label: t("bank_transfer") },
    { value: "Cash", label: t("cash") },
    { value: "Online", label: t("online") },
  ];

  // Status Options
  const statusOptions = [
    { value: "Paid", label: t("paid") },
    { value: "Unpaid", label: t("unpaid") },
    { value: "partial", label: t("partial") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData: Partial<IncomeType> = {
      date: data.date as string,
      amount: Number(data.amount),
      source: data.source as string,
      companyName: data.companyName as string,
      paymentMethod: data.paymentMethod as string,
      note: data.note as string,
      status: data.status as string,
      vatPercent: Number(data.vatPercent) || 0,
      vatAmount: vatAmount,
    };

    await onSave(processedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          {selectedIncome ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedIncome ? t("edit_income") : t("add_income")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="date"
              type="date"
              defaultValue={
                selectedIncome?.date
                  ? new Date(selectedIncome.date).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              required
              fullWidth
            />
          </div>

          {/* Source Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("source")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="source"
              defaultValue={selectedIncome?.source || ""}
              options={sourceOptions}
              placeholder={t("select_source")}
              required
              fullWidth
            />
          </div>

          {/* Payment Method Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("payment_method")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="paymentMethod"
              defaultValue={selectedIncome?.paymentMethod || "Bank Transfer"}
              options={paymentMethodOptions}
              required
              fullWidth
            />
          </div>

          {/* Company Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("company_name")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="companyName"
              defaultValue={selectedIncome?.companyName}
              placeholder={t("enter_company_name")}
              required
              fullWidth
            />
          </div>

          {/* Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("amount")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0"
              required
              fullWidth
            />
          </div>

          {/* VAT Percent */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("vat_percent")}
            </label>
            <div className="relative">
              <Input
                name="vatPercent"
                type="number"
                value={vatPercent}
                onChange={(e) => setVatPercent(Number(e.target.value))}
                placeholder="0"
                fullWidth
              />
              <Percent size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* VAT Amount (Auto-calculated, read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("vat_amount")}
            </label>
            <Input
              value={vatAmount.toFixed(2)}
              readOnly
              className="bg-gray-50 cursor-not-allowed"
              fullWidth
            />
          </div>

          {/* Total with VAT (Auto-calculated, read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("total_with_vat")}
            </label>
            <Input
              value={totalWithVat.toFixed(2)}
              readOnly
              className="bg-gray-50 cursor-not-allowed font-semibold text-indigo-600"
              fullWidth
            />
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("status")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="status"
              defaultValue={selectedIncome?.status || "Unpaid"}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            {t("note")} <span className="text-red-500">*</span>
          </label>
          <TextArea
            name="note"
            defaultValue={selectedIncome?.note}
            placeholder={t("enter_note")}
            className="min-h-[100px]"
            required
            fullWidth
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button variant="secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {selectedIncome ? t("save") : t("add_income")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};