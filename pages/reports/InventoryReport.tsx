import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Filter, X, Package, Box, 
  AlertTriangle, CheckCircle, TrendingUp, ChevronDown 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { useData } from "../../context/DataContext";
import { InventoryReport as InventoryReportType } from "../../types";

export const InventoryReport: React.FC = () => {
  const { t } = useTranslation();
  const { inventoryReports } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    const categories = inventoryReports.map(r => r.category).filter(Boolean);
    return Array.from(new Set(categories));
  }, [inventoryReports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return inventoryReports.filter(r => {
      const matchesSearch = 
        r.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || r.category === categoryFilter;
      
      let matchesStock = true;
      if (stockFilter === "in_stock") {
        matchesStock = (r.inStockQty || 0) > 0;
      } else if (stockFilter === "out_of_stock") {
        matchesStock = (r.inStockQty || 0) === 0;
      } else if (stockFilter === "low_stock") {
        matchesStock = (r.inStockQty || 0) > 0 && (r.inStockQty || 0) <= 5;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [inventoryReports, searchTerm, categoryFilter, stockFilter]);

  // Statistics
  const totalProducts = filteredReports.length;
  const totalInStock = filteredReports.reduce((sum, r) => sum + (r.inStockQty || 0), 0);
  const outOfStockCount = filteredReports.filter(r => (r.inStockQty || 0) === 0).length;
  const lowStockCount = filteredReports.filter(r => (r.inStockQty || 0) > 0 && (r.inStockQty || 0) <= 5).length;
  const inStockCount = filteredReports.filter(r => (r.inStockQty || 0) > 5).length;

  const getStockBadge = (qty: number) => {
    if (qty === 0) {
      return <Badge variant="danger" className="flex items-center gap-1"><AlertTriangle size={12} /> {t("out_of_stock")}</Badge>;
    }
    if (qty <= 5) {
      return <Badge variant="warning" className="flex items-center gap-1"><AlertTriangle size={12} /> {t("low_stock")}</Badge>;
    }
    return <Badge variant="success" className="flex items-center gap-1"><CheckCircle size={12} /> {t("in_stock")}</Badge>;
  };

  const categoryOptions = [
    { value: "", label: t("all_categories") },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
  ];

  const stockOptions = [
    { value: "", label: t("all_stock_status") },
    { value: "in_stock", label: t("in_stock") },
    { value: "low_stock", label: t("low_stock") },
    { value: "out_of_stock", label: t("out_of_stock") },
  ];

  const columns: Column<InventoryReportType>[] = [
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
      header: t("stock_quantity"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Box size={14} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-600">{item.inStockQty || 0}</span>
          </div>
          {getStockBadge(item.inStockQty || 0)}
        </div>
      )
    },
    {
      header: t("status"),
      render: (item) => {
        const qty = item.inStockQty || 0;
        if (qty === 0) {
          return <span className="text-sm text-red-600">{t("needs_restock")}</span>;
        }
        if (qty <= 5) {
          return <span className="text-sm text-orange-600">{t("reorder_soon")}</span>;
        }
        return <span className="text-sm text-green-600">{t("sufficient")}</span>;
      }
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStockFilter("");
  };

  const hasFilters = searchTerm || categoryFilter || stockFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("inventory_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_inventory_report")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredReports} filename="inventory-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_products")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Box size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_units")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalInStock.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("in_stock")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{inStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("out_of_stock")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{outOfStockCount}</p>
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

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {stockOptions.map((option) => (
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
          keyExtractor={(item) => `${item.sku}-${item.productName}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};