import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Filter, X, DollarSign, Package, 
  TrendingUp, ShoppingCart, ChevronDown 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { useData } from "../../context/DataContext";
import { PurchaseReport as PurchaseReportType } from "../../types";

export const PurchaseReport: React.FC = () => {
  const { t } = useTranslation();
  const { purchaseReports } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = purchaseReports.map(r => r.category).filter(Boolean);
    return Array.from(new Set(categories));
  }, [purchaseReports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return purchaseReports.filter(r => {
      const matchesSearch = 
        r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [purchaseReports, searchTerm, categoryFilter]);

  // Statistics
  const totalPurchases = filteredReports.length;
  const totalQty = filteredReports.reduce((sum, r) => sum + (r.purchaseQty || 0), 0);
  const totalAmount = filteredReports.reduce((sum, r) => sum + (r.purchaseAmount || 0), 0);
  const averagePerPurchase = totalPurchases > 0 ? totalAmount / totalPurchases : 0;
  const averagePrice = totalQty > 0 ? totalAmount / totalQty : 0;

  const categoryOptions = [
    { value: "", label: t("all_categories") },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
  ];

  const columns: Column<PurchaseReportType>[] = [
    {
      header: t("purchase_info"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <ShoppingCart size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.reference}</span>
            <span className="text-xs text-gray-500">{item.sku}</span>
          </div>
        </div>
      )
    },
    {
      header: t("product"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">{item.productName}</span>
          <Badge variant="info" className="w-fit bg-gray-100 text-gray-700 text-xs">
            {item.category || "-"}
          </Badge>
        </div>
      )
    },
    {
      header: t("quantity"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">{item.purchaseQty}</span>
        </div>
      )
    },
    {
      header: t("amount"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            {item.purchaseAmount?.toLocaleString()} EGP
          </span>
        </div>
      )
    },
    {
      header: t("unit_price"),
      render: (item) => {
        const unitPrice = item.purchaseQty > 0 ? item.purchaseAmount / item.purchaseQty : 0;
        return (
          <span className="text-sm text-gray-600">
            {unitPrice.toLocaleString()} EGP
          </span>
        );
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
  };

  const hasFilters = searchTerm || categoryFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("purchase_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_purchase_report")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredReports} filename="purchase-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_purchases")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalPurchases}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_quantity")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalQty.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_amount")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("average_per_purchase")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{averagePerPurchase.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("average_unit_price")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{averagePrice.toLocaleString()} EGP</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_purchases")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {t("clear_filters")}
          </button>
        )}
      </div>

      {/* Table */}
        <Table
          data={filteredReports}
          columns={columns}
          keyExtractor={(item) => `${item.reference}-${item.sku}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};