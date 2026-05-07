import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, Filter, X, DollarSign, Users, ShoppingBag, CreditCard, ChevronDown } from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../components/ui/Common";
import { Table, Column } from "../../components/ui/Table";
import { useData } from "../../context/DataContext";
import { CustomerReport as CustomerReportType } from "../../types";

export const CustomerReport: React.FC = () => {
  const { t } = useTranslation();
  const { customerReports } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get unique payment methods for filter
  const uniquePaymentMethods = useMemo(() => {
    const methods = customerReports.map(r => r.paymentMethod).filter(Boolean);
    return Array.from(new Set(methods));
  }, [customerReports]);

  // Apply filters
  const filteredReports = useMemo(() => {
    return customerReports.filter(r => {
      const matchesSearch = 
        r.customerInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reference?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPayment = !paymentFilter || r.paymentMethod === paymentFilter;
      
      return matchesSearch && matchesPayment;
    });
  }, [customerReports, searchTerm, paymentFilter]);

  // Statistics
  const totalCustomers = filteredReports.length;
  const totalOrders = filteredReports.reduce((sum, r) => sum + (r.totalOrders || 0), 0);
  const totalAmount = filteredReports.reduce((sum, r) => sum + (r.amount || 0), 0);
  const averagePerCustomer = totalCustomers > 0 ? totalAmount / totalCustomers : 0;

  const getPaymentBadge = (method: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "info"; label: string }> = {
      PAID: { variant: "success", label: t("paid") },
      PARTIALLY_PAID: { variant: "warning", label: t("partially_paid") },
      UNPAID: { variant: "danger", label: t("unpaid") },
    };
    const config = statusMap[method] || { variant: "info", label: method };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const paymentOptions = [
    { value: "", label: t("all_payment_methods") },
    ...uniquePaymentMethods.map(method => ({ value: method, label: method })),
  ];

  const columns: Column<CustomerReportType>[] = [
    {
      header: t("customer_info"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.customerInfo}</span>
            <span className="text-xs text-gray-500">{item.code}</span>
          </div>
        </div>
      )
    },
    {
      header: t("reference_no"),
      render: (item) => (
        <span className="text-sm font-mono text-gray-600">{item.reference}</span>
      )
    },
    {
      header: t("orders"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <ShoppingBag size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">{item.totalOrders}</span>
        </div>
      )
    },
    {
      header: t("amount"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            {item.amount?.toLocaleString()} EGP
          </span>
        </div>
      )
    },
    {
      header: t("payment_method"),
      render: (item) => getPaymentBadge(item.paymentMethod)
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setPaymentFilter("");
  };

  const hasFilters = searchTerm || paymentFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("customer_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_customer_report")}
          </p>
        </div>
        <div className="flex gap-3">
          <ExportDropdown data={filteredReports} filename="customer-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_customers")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_orders")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_revenue")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totalAmount.toLocaleString()} EGP</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-600" />
            <p className="text-xs text-gray-500">{t("average_per_customer")}</p>
          </div>
          <p className="text-xl font-bold text-purple-600 mt-1">{averagePerCustomer.toLocaleString()} EGP</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_customers")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {paymentOptions.map((option) => (
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
          keyExtractor={(item) => `${item.reference}-${item.code}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};

// Add missing import
import { TrendingUp } from "lucide-react";