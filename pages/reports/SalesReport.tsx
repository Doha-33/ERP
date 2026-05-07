import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { 
  Download, ChevronDown, Search, Calendar, 
  DollarSign, Package, TrendingUp, Filter, X 
} from "lucide-react";
import { Card, Button, Input, Badge, ExportDropdown } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { useData } from "../../context/DataContext";
import { SalesReport as SalesReportType } from "../../types";

export const SalesReport: React.FC = () => {
  const { t } = useTranslation();
  const { salesReports } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = salesReports.map(r => r.category).filter(Boolean);
    return Array.from(new Set(categories));
  }, [salesReports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return salesReports.filter(r => {
      const matchesSearch = 
        r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [salesReports, searchTerm, categoryFilter]);

  // Statistics
  const totalSoldQty = filteredReports.reduce((sum, r) => sum + (r.soldQty || 0), 0);
  const totalSoldAmount = filteredReports.reduce((sum, r) => sum + (r.soldAmount || 0), 0);
  const totalProducts = filteredReports.length;
  const averageValue = totalSoldQty > 0 ? totalSoldAmount / totalSoldQty : 0;

  const categoryOptions = [
    { value: "", label: t("all_categories") },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
  ];

  const columns: Column<SalesReportType>[] = [
    {
      header: t("product_info"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Package size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.productName}</span>
            <span className="text-xs text-gray-500">{item.sku}</span>
          </div>
        </div>
      )
    },
    {
      header: t("category"),
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.category || "-"}
        </Badge>
      )
    },
    {
      header: t("sold_qty"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">{item.soldQty}</span>
        </div>
      )
    },
    {
      header: t("sold_amount"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            {item.soldAmount?.toLocaleString()} EGP
          </span>
        </div>
      )
    },
    {
      header: t("avg_price"),
      render: (item) => {
        const avgPrice = item.soldQty > 0 ? item.soldAmount / item.soldQty : 0;
        return (
          <span className="text-sm text-gray-600">
            {avgPrice.toLocaleString()} EGP
          </span>
        );
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || categoryFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("sales_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_sales_report")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredReports} filename="sales-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_products_sold")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_quantity")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalSoldQty.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_revenue")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalSoldAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("average_order_value")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{averageValue.toLocaleString()} EGP</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_products")}
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
          keyExtractor={(item) => `${item.productId}-${item.sku}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};