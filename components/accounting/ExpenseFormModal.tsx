// src/components/accounting/ExpenseFormModal.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Edit2, Plus, CreditCard, Paperclip, Link as LinkIcon, X, Trash2, Eye, Upload, Link, Building2, Percent } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button, Input, Select, TextArea, FileUpload } from "../../components/ui/Common";
import { Expense as ExpenseType } from "../../types";
import { toast } from "sonner";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExpense: ExpenseType | null;
  onSave: (data: Partial<ExpenseType>) => Promise<void>;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  selectedExpense,
  onSave,
}) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(selectedExpense?.amount || 0);
  const [vatPercent, setVatPercent] = useState<number>(selectedExpense?.vatPercent || 0);
  const [vatAmount, setVatAmount] = useState<number>(selectedExpense?.vatAmount || 0);
  const [totalWithVat, setTotalWithVat] = useState<number>(selectedExpense?.amount || 0);

  // Calculate VAT amount and total when amount or VAT percent changes
  useEffect(() => {
    const calculatedVatAmount = (amount * vatPercent) / 100;
    setVatAmount(calculatedVatAmount);
    setTotalWithVat(amount + calculatedVatAmount);
  }, [amount, vatPercent]);

  // Category Options
  const categoryOptions = [
    { value: "Supplies", label: t("supplies") },
    { value: "Rent", label: t("rent") },
    { value: "Utilities", label: t("utilities") },
    { value: "Salaries", label: t("salaries") },
    { value: "Marketing", label: t("marketing") },
    { value: "Travel", label: t("travel") },
    { value: "Equipment", label: t("equipment") },
    { value: "Other", label: t("other_expense") },
  ];

  // Payment Method Options
  const paymentMethodOptions = [
    { value: "Cash", label: t("cash") },
    { value: "Bank Transfer", label: t("bank_transfer") },
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

    const processedData: Partial<ExpenseType> = {
      date: data.date as string,
      amount: Number(data.amount),
      payee: data.payee as string,
      category: data.category as string,
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
          {selectedExpense ? <Edit2 size={20} /> : <Plus size={20} />}
          {selectedExpense ? t("edit_expense") : t("add_expense")}
        </div>
      }
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-x-8 gap-y-4">
          {/* Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("date")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="date"
              type="date"
              defaultValue={
                selectedExpense?.date
                  ? new Date(selectedExpense.date).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              required
              fullWidth
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("category")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="category"
              defaultValue={selectedExpense?.category || ""}
              options={categoryOptions}
              placeholder={t("select_category")}
              required
              fullWidth
            />
          </div>

          {/* Payee (المستفيد) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {t("payee")} <span className="text-red-500">*</span>
            </label>
            <Input
              name="payee"
              defaultValue={selectedExpense?.payee || selectedExpense?.vendorName}
              placeholder={t("enter_payee_name")}
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
              defaultValue={selectedExpense?.paymentMethod || "Cash"}
              options={paymentMethodOptions}
              required
              fullWidth
            />
          </div>

          {/* Note */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              {t("note")} <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="note"
              defaultValue={selectedExpense?.note}
              placeholder={t("enter_note")}
              className="min-h-[80px]"
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
              defaultValue={selectedExpense?.status || "Pending"}
              options={statusOptions}
              required
              fullWidth
            />
          </div>
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
            {selectedExpense ? t("save") : t("add_expense")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};