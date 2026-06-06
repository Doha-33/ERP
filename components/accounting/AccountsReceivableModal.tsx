import React, { useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button, Input, Select, TextArea } from "../ui/Common";
import { AccountReceivable } from "../../types";
import { useCRM } from "../../context/crm/CRMContext";
import { useData } from "../../context/DataContext";

const arSchema = z.object({
  contactId: z.string().min(1, "Customer is required"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currencyId: z.string().min(1, "Currency is required"),
  exchangeRate: z.number().min(0, "Exchange rate must be positive"),
  paymentType: z.enum(["CASH", "CREDIT"]),
  cashAccountId: z.string().optional(),
  amount: z.number().min(0, "Amount must be positive"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Price must be positive"),
        total: z.number().min(0),
      }),
    )
    .min(1, "At least one item is required"),
});

type ARFormData = z.infer<typeof arSchema>;

interface ARModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  arToEdit?: AccountReceivable | null;
}

export const AccountsReceivableModal: React.FC<ARModalProps> = ({
  isOpen,
  onClose,
  onSave,
  arToEdit,
}) => {
  const { t, i18n } = useTranslation();
  const { contacts } = useCRM();
  const { accounts, products, currencies } = useData();
  const isRTL = i18n.language === "ar";

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ARFormData>({
    resolver: zodResolver(arSchema),
    defaultValues: {
      contactId: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      currencyId: "",
      exchangeRate: 1,
      amount: 0,
      paymentType: "CASH",
      cashAccountId: "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0, total: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchPaymentType = watch("paymentType");
  const watchCurrencyId = watch("currencyId");

  // Function to calculate total for a single item
  const calculateItemTotal = useCallback(
    (quantity: number, unitPrice: number): number => {
      return (quantity || 0) * (unitPrice || 0);
    },
    [],
  );

  // Function to update item total and recalculate grand total
  const updateItemTotal = useCallback(
    (index: number, quantity: number, unitPrice: number) => {
      const newTotal = calculateItemTotal(quantity, unitPrice);
      setValue(`items.${index}.total`, newTotal);

      // Recalculate grand total
      const currentItems = getValues("items");
      const grandTotal = currentItems.reduce((sum, item, idx) => {
        if (idx === index) {
          return sum + newTotal;
        }
        return sum + (item.total || 0);
      }, 0);
      setValue("amount", grandTotal);
    },
    [setValue, getValues, calculateItemTotal],
  );

  // Handle product selection - auto-fill unit price
  const handleProductChange = useCallback(
    (index: number, productId: string) => {
      const product = products.find(
        (p) => p._id === productId || p.id === productId,
      );
      if (product) {
        const sellingPrice = product.sellingPrice || product.salesPrice || 0;
        setValue(`items.${index}.unitPrice`, sellingPrice);
        setValue(`items.${index}.productId`, productId);

        // Update total with current quantity
        const currentQuantity = getValues(`items.${index}.quantity`) || 1;
        updateItemTotal(index, currentQuantity, sellingPrice);
      }
    },
    [products, setValue, getValues, updateItemTotal],
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (index: number, quantity: number) => {
      const currentUnitPrice = getValues(`items.${index}.unitPrice`) || 0;
      setValue(`items.${index}.quantity`, quantity);
      updateItemTotal(index, quantity, currentUnitPrice);
    },
    [getValues, setValue, updateItemTotal],
  );

  // Handle unit price change
  const handleUnitPriceChange = useCallback(
    (index: number, unitPrice: number) => {
      const currentQuantity = getValues(`items.${index}.quantity`) || 1;
      setValue(`items.${index}.unitPrice`, unitPrice);
      updateItemTotal(index, currentQuantity, unitPrice);
    },
    [getValues, setValue, updateItemTotal],
  );

  useEffect(() => {
    if (currencies && currencies.length > 0 && !watchCurrencyId) {
      const baseCurrency =
        currencies.find((c) => c.isBaseCurrency) || currencies[0];
      setValue(
        "currencyId",
        (baseCurrency as any)._id || baseCurrency.id || "",
      );
    }
  }, [currencies, watchCurrencyId, setValue]);

  useEffect(() => {
    if (arToEdit) {
      reset({
        contactId: (arToEdit as any).contactId || "",
        invoiceNumber: arToEdit.invoiceNumber,
        invoiceDate: arToEdit.invoiceDate
          ? new Date(arToEdit.invoiceDate).toISOString().split("T")[0]
          : "",
        dueDate: arToEdit.dueDate
          ? new Date(arToEdit.dueDate).toISOString().split("T")[0]
          : "",
        currencyId: (arToEdit as any).currencyId || "",
        exchangeRate: (arToEdit as any).exchangeRate || 1,
        amount: arToEdit.amount || 0,
        paymentType: ((arToEdit as any).paymentType as any) || "CASH",
        cashAccountId: (arToEdit as any).cashAccountId || "",
        notes: arToEdit.notes || "",
        items: (arToEdit as any).items || [
          { productId: "", quantity: 1, unitPrice: 0, total: 0 },
        ],
      });
    } else {
      const baseCurrency =
        currencies.find((c) => c.isBaseCurrency) || currencies[0];
      reset({
        contactId: "",
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        currencyId: (baseCurrency as any)?._id || baseCurrency?.id || "",
        exchangeRate: 1,
        amount: 0,
        paymentType: "CASH",
        cashAccountId: "",
        notes: "",
        items: [{ productId: "", quantity: 1, unitPrice: 0, total: 0 }],
      });
    }
  }, [arToEdit, reset, currencies]);

  const onSubmit = (data: ARFormData) => {
    // Create a copy of the data to modify
    const submissionData = { ...data };

    // If payment type is CREDIT, remove cashAccountId from submission
    if (data.paymentType === "CREDIT") {
      delete submissionData.cashAccountId;
    }

    // If cashAccountId is an empty string, remove it as well
    if (submissionData.cashAccountId === "") {
      delete submissionData.cashAccountId;
    }

    onSave(submissionData);
  };
  const customerOptions = contacts
    .filter((c) => c.isCustomer)
    .map((c) => ({
      value: (c as any)._id || c.id || "",
      label: c.name || (c as any).customerName || "",
    }));

  // Filter accounts based on accountCategory (CASH or BANK) for payment accounts
  const cashBankAccounts = accounts
    .filter(
      (a) =>
        a.accountType === "ASSET" &&
        (a.accountCategory === "CASH" || a.accountCategory === "BANK"),
    )
    .map((a) => ({
      value: (a as any)._id || a.id || "",
      label: `${a.accountName} (${a.accountCode})`,
    }));

  const currencyOptions = currencies.map((c) => ({
    value: (c as any)._id || c.id || "",
    label: `${c.name} (${c.code})`,
  }));

  const productOptions = products.map((p) => ({
    value: (p as any)._id || p.id || "",
    label: `${p.productName} - ${(p.sellingPrice || p.salesPrice || 0).toLocaleString()} EGP`,
  }));

  const paymentTypeOptions = [
    { value: "CASH", label: t("cash") },
    { value: "CREDIT", label: t("credit") },
  ];

  // Show account field only for CASH payment type
  const showAccountField = watchPaymentType === "CASH";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        arToEdit ? t("edit_accounts_receivable") : t("add_accounts_receivable")
      }
      className="w-full max-w-4xl mx-4 sm:mx-auto"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t("customer")}
            options={customerOptions}
            value={watch("contactId")}
            onChange={(e) => setValue("contactId", e.target.value)}
            error={errors.contactId?.message}
            required
            fullWidth
            placeholder={t("select_customer")}
          />

          <Input
            label={t("invoice_number")}
            {...register("invoiceNumber")}
            error={errors.invoiceNumber?.message}
            required
            fullWidth
          />

          <Select
            label={t("payment_type")}
            options={paymentTypeOptions}
            value={watch("paymentType")}
            onChange={(e) => setValue("paymentType", e.target.value as any)}
            error={errors.paymentType?.message}
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t("invoice_date")}
            type="date"
            {...register("invoiceDate")}
            error={errors.invoiceDate?.message}
            required
            fullWidth
          />
          <Input
            label={t("due_date")}
            type="date"
            {...register("dueDate")}
            error={errors.dueDate?.message}
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label={t("currency")}
            options={currencyOptions}
            value={watch("currencyId")}
            onChange={(e) => setValue("currencyId", e.target.value)}
            error={errors.currencyId?.message}
            required
            fullWidth
          />
          <Input
            label={t("exchange_rate")}
            type="number"
            step="0.0001"
            {...register("exchangeRate", { valueAsNumber: true })}
            error={errors.exchangeRate?.message}
            required
            fullWidth
          />
          {showAccountField && (
            <Select
              label={t("cash_account")}
              options={cashBankAccounts}
              value={watch("cashAccountId")}
              onChange={(e) => setValue("cashAccountId", e.target.value)}
              error={errors.cashAccountId?.message}
              required={showAccountField}
              fullWidth
              placeholder={t("select_cash_account")}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("items")}
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ productId: "", quantity: 1, unitPrice: 0, total: 0 })
              }
              className="flex items-center gap-1"
            >
              <Plus size={16} /> {t("add_item")}
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-3 min-w-[200px]">{t("product")}</th>
                  <th className="px-4 py-3 w-24">{t("quantity")}</th>
                  <th className="px-4 py-3 w-32">{t("unit_price")}</th>
                  <th className="px-4 py-3 w-32">{t("total")}</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y text-gray-600">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-gray-50 bg-white">
                    <td className="px-4 py-2">
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={watch(`items.${index}.productId`)}
                        onChange={(e) =>
                          handleProductChange(index, e.target.value)
                        }
                      >
                        <option value="">{t("select_product")}</option>
                        {productOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productId && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.items[index]?.productId?.message}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="1"
                        value={watch(`items.${index}.quantity`)}
                        onChange={(e) =>
                          handleQuantityChange(index, Number(e.target.value))
                        }
                        error={errors.items?.[index]?.quantity?.message}
                        fullWidth
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={watch(`items.${index}.unitPrice`)}
                        onChange={(e) =>
                          handleUnitPriceChange(index, Number(e.target.value))
                        }
                        error={errors.items?.[index]?.unitPrice?.message}
                        fullWidth
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        readOnly
                        value={watch(`items.${index}.total`)}
                        className="bg-gray-50 font-semibold"
                        fullWidth
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        disabled={fields.length === 1}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.items?.message && (
            <p className="text-red-500 text-xs">{errors.items.message}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-t">
          <div className="w-full md:w-2/3">
            <TextArea
              label={t("notes")}
              {...register("notes")}
              error={errors.notes?.message}
              fullWidth
              rows={2}
            />
          </div>
          <div className="w-full md:w-1/3 flex flex-col items-end">
            <div className="text-sm text-gray-500">{t("total_amount")}</div>
            <div className="text-2xl font-bold text-blue-600">
              {watch("amount").toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <input
              type="hidden"
              {...register("amount", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full sm:w-auto justify-center"
          >
            {t("save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
