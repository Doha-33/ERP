import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Calendar, RefreshCw } from "lucide-react";
import {
  Card,
  Button,
  Input,
  Select,
  ExportDropdown,
} from "../../components/ui/Common";
import { Modal } from "../../components/ui/Modal";
import { Table, Column } from "../../components/ui/Table";
import { useData } from "../../context/DataContext";
import { ExchangeRate, Currency } from "../../types";
import { toast } from "sonner";

export const ExchangeRates: React.FC = () => {
  const { t, i18n } = useTranslation(); // <-- أضفنا i18n لمعرفة اللغة الحالية
  const { exchangeRates, currencies, accountingLoading, addExchangeRate } =
    useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // التحقق من أن اللغة الحالية هي العربية لتطبيق الاتجاه RTL
  const isRTL = i18n.language === 'ar';

  const filteredRates = exchangeRates.filter((rate) => {
    const fromCode =
      typeof rate.fromCurrency === "object"
        ? (rate.fromCurrency as any).code
        : "";
    const toCode =
      typeof rate.toCurrency === "object" ? (rate.toCurrency as any).code : "";
    return (
      (fromCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (toCode || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns: Column<ExchangeRate>[] = [
    {
      header: t("from_currency"),
      render: (item) =>
        typeof item.fromCurrency === "object"
          ? `${(item.fromCurrency as any).name} (${(item.fromCurrency as any).code})`
          : item.fromCurrency,
    },
    {
      header: t("to_currency"),
      render: (item) =>
        typeof item.toCurrency === "object"
          ? `${(item.toCurrency as any).name} (${(item.toCurrency as any).code})`
          : item.toCurrency,
    },
    {
      header: t("rate"),
      render: (item) =>
        item.rate.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 6,
        }),
    },
    {
      header: t("date"),
      render: (item) => new Date(item.date).toLocaleString(),
    },
  ];

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fromCurrency: formData.get("fromCurrency"),
      toCurrency: formData.get("toCurrency"),
      rate: Number(formData.get("rate")),
    };
    try {
      await addExchangeRate(data);
      setIsAddModalOpen(false);
      toast.success(t("exchange_rate_added_successfully"));
    } catch (error) {
      console.error(error);
      toast.error(t("failed_to_add_exchange_rate"));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("exchange_rates")}
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            {t("manage_currency_exchange_rates")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <ExportDropdown data={exchangeRates} filename="exchange_rates" />
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> {t("add_exchange_rate")}
          </Button>
        </div>
      </div>

      {/* Search Section - تحسين Responsive */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white rounded-lg border border-gray-200">
        <Input
          placeholder={t("search_currencies")}
          icon={<Search size={18} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md"
          fullWidth // التأكد من أنه يأخذ العرض الكامل على الموبايل
        />
      </div>

      {/* Table Section - جعل الجدول متجاوباً عن طريق التمرير الأفقي */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <Table
            data={filteredRates}
            columns={columns}
            keyExtractor={(item) => item._id || ""}
            isLoading={accountingLoading}
          />
        </div>
      </div>

      {/* Modal Section - تحسين Responsive وعرض النموذج بشكل أفضل */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t("add_exchange_rate")}
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-4">
          {/* جعل الحقول تتراص عمودياً على الشاشات الصغيرة وأفقياً على الكبيرة */}
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
            <Select
              label={t("from_currency")}
              name="fromCurrency"
              options={currencies.map((c) => ({
                value: c._id || c.id || "",
                label: `${c.name} (${c.code})`,
              }))}
              required
              fullWidth
            />
            <Select
              label={t("to_currency")}
              name="toCurrency"
              options={currencies.map((c) => ({
                value: c._id || c.id || "",
                label: `${c.name} (${c.code})`,
              }))}
              required
              fullWidth
            />
          </div>
          
          <Input
            label={t("rate")}
            name="rate"
            type="number"
            step="0.000001"
            placeholder="0.00"
            required
            fullWidth
            icon={<RefreshCw size={18} />}
          />
          
          {/* جعل الأزرار بعرض كامل على الموبايل */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button 
              type="submit" 
              isLoading={accountingLoading}
              className="w-full sm:w-auto"
            >
              {t("create_exchange_rate")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};