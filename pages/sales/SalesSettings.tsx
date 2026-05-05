import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Settings, DollarSign, Package, RefreshCw } from "lucide-react";
import { Card, Button, Input, Select, Switch } from "../../components/ui/Common";
import salesService from "../../services/sales.service";
import { toast } from "sonner";

const salesSettingsSchema = z.object({
  vatPercentage: z.number().min(0).max(100),
  invoiceNumberingMethod: z.enum(["AUTO", "MANUAL"]),
  defaultPricelist: z.string().min(1),
  defaultPaymentTerms: z.string().min(1),
  defaultCurrency: z.string().min(1),
  allowReturnsWithoutInvoice: z.boolean(),
  allowSellingOutOfStock: z.boolean(),
});

type SalesSettingsFormData = z.infer<typeof salesSettingsSchema>;

export const SalesSettings: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SalesSettingsFormData>({
    resolver: zodResolver(salesSettingsSchema),
    defaultValues: {
      vatPercentage: 14,
      invoiceNumberingMethod: "AUTO",
      defaultPricelist: "Standard Pricelist",
      defaultPaymentTerms: "Net 30",
      defaultCurrency: "EGP",
      allowReturnsWithoutInvoice: false,
      allowSellingOutOfStock: false,
    },
  });

  const allowReturns = watch("allowReturnsWithoutInvoice");
  const allowOutOfStock = watch("allowSellingOutOfStock");

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await salesService.getSettings();
      if (data) {
        reset({
          vatPercentage: data.vatPercentage || 14,
          invoiceNumberingMethod: data.invoiceNumberingMethod || "AUTO",
          defaultPricelist: data.defaultPricelist || "Standard Pricelist",
          defaultPaymentTerms: data.defaultPaymentTerms || "Net 30",
          defaultCurrency: data.defaultCurrency || "EGP",
          allowReturnsWithoutInvoice: data.allowReturnsWithoutInvoice || false,
          allowSellingOutOfStock: data.allowSellingOutOfStock || false,
        });
      }
    } catch (error) {
      console.error("Error fetching sales settings:", error);
      toast.error(t("failed_to_load_settings"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const onSubmit: SubmitHandler<SalesSettingsFormData> = async (data) => {
    try {
      setIsSaving(true);
      await salesService.updateSalesSettings(data);
      toast.success(t("settings_saved_successfully"));
    } catch (error) {
      console.error("Error saving sales settings:", error);
      toast.error(t("failed_to_save_settings"));
    } finally {
      setIsSaving(false);
    }
  };

  const numberingMethodOptions = [
    { value: "AUTO", label: t("automatic") },
    { value: "MANUAL", label: t("manual") },
  ];

  const currencyOptions = [
    { value: "EGP", label: "EGP - Egyptian Pound" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "SAR", label: "SAR - Saudi Riyal" },
    { value: "AED", label: "AED - UAE Dirham" },
    { value: "GBP", label: "GBP - British Pound" },
  ];

  const paymentTermsOptions = [
    { value: "Cash on Delivery", label: t("cash_on_delivery") },
    { value: "Net 7", label: "Net 7 Days" },
    { value: "Net 15", label: "Net 15 Days" },
    { value: "Net 30", label: "Net 30 Days" },
    { value: "Net 45", label: "Net 45 Days" },
    { value: "Net 60", label: "Net 60 Days" },
    { value: "Due on Receipt", label: t("due_on_receipt") },
  ];

  const pricelistOptions = [
    { value: "Standard Pricelist", label: t("standard_pricelist") },
    { value: "Wholesale Pricelist", label: t("wholesale_pricelist") },
    { value: "Retail Pricelist", label: t("retail_pricelist") },
    { value: "VIP Pricelist", label: t("vip_pricelist") },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings size={24} className="text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {t("sales_settings")}
            </h1>
          </div>
          <p className="text-gray-500 mt-1">
            {t("configure_your_sales_module")}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchSettings}
          className="border-gray-200"
          disabled={isLoading}
        >
          <RefreshCw size={18} />
          {t("refresh")}
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
            <DollarSign size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("general_settings")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* VAT Percentage */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("vat_percentage")} (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("vatPercentage", { valueAsNumber: true })}
                error={errors.vatPercentage?.message}
                required
                fullWidth
              />
              <p className="text-xs text-gray-500">
                {t("vat_percentage_description")}
              </p>
            </div>

            {/* Invoice Numbering Method */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("invoice_numbering_method")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("invoiceNumberingMethod")}
                error={errors.invoiceNumberingMethod?.message}
                options={numberingMethodOptions}
                required
                fullWidth
              />
              <p className="text-xs text-gray-500">
                {t("invoice_numbering_description")}
              </p>
            </div>

            {/* Default Pricelist */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("default_pricelist")} <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("defaultPricelist")}
                error={errors.defaultPricelist?.message}
                options={pricelistOptions}
                required
                fullWidth
              />
            </div>

            {/* Default Payment Terms */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("default_payment_terms")} <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("defaultPaymentTerms")}
                error={errors.defaultPaymentTerms?.message}
                options={paymentTermsOptions}
                required
                fullWidth
              />
            </div>

            {/* Default Currency */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {t("default_currency")} <span className="text-red-500">*</span>
              </label>
              <Select
                {...register("defaultCurrency")}
                error={errors.defaultCurrency?.message}
                options={currencyOptions}
                required
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Inventory & Returns Settings */}
        <Card className="bg-white p-6">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100">
            <Package size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("inventory_returns")}
            </h2>
          </div>
          <div className="space-y-4">
            {/* Allow Returns Without Invoice */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">
                  {t("allow_returns_without_invoice")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("allow_returns_without_invoice_description")}
                </p>
              </div>
              <Switch
                checked={allowReturns}
                onChange={(checked) =>
                  setValue("allowReturnsWithoutInvoice", checked)
                }
              />
            </div>

            {/* Allow Selling Out of Stock */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">
                  {t("allow_selling_out_of_stock")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("allow_selling_out_of_stock_description")}
                </p>
              </div>
              <Switch
                checked={allowOutOfStock}
                onChange={(checked) =>
                  setValue("allowSellingOutOfStock", checked)
                }
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            type="button"
            onClick={() => fetchSettings()}
            className="border-gray-200"
            disabled={isSaving}
          >
            {t("reset")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
            isLoading={isSaving}
            disabled={isSaving}
          >
            <Save size={18} className="mr-2" />
            {t("save_settings")}
          </Button>
        </div>
      </form>
    </div>
  );
};