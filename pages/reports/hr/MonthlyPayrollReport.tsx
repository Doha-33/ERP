import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, DollarSign, TrendingUp, 
  User, Wallet, Filter, X, Download, RefreshCw 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const MonthlyPayrollReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getMonthlyPayrollReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeId: item.employeeId,
        employeeName: item.name,
        employeeCode: item.employeeCode,
        basicSalary: item.basicSalary || 0,
        allowances: item.allowances || 0,
        deductions: item.deductions || 0,
        overtimeAmount: item.overtimeAmount || 0,
        netSalary: item.netSalary || 0,
        payrollMonth: item.payrollMonth,
        payrollYear: item.payrollYear,
        paymentStatus: item.paymentStatus || "PENDING",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Error fetching monthly payroll report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMonth = !selectedMonth || item.payrollMonth === parseInt(selectedMonth);
      const matchesYear = !selectedYear || item.payrollYear === parseInt(selectedYear);
      const matchesPayment = !paymentFilter || item.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesMonth && matchesYear && matchesPayment;
    });
  }, [data, searchTerm, selectedMonth, selectedYear, paymentFilter]);

  // Statistics
  const totalEmployees = filteredData.length;
  const totalBasicSalary = filteredData.reduce((sum, item) => sum + (item.basicSalary || 0), 0);
  const totalAllowances = filteredData.reduce((sum, item) => sum + (item.allowances || 0), 0);
  const totalDeductions = filteredData.reduce((sum, item) => sum + (item.deductions || 0), 0);
  const totalNetSalary = filteredData.reduce((sum, item) => sum + (item.netSalary || 0), 0);
  const totalOvertime = filteredData.reduce((sum, item) => sum + (item.overtimeAmount || 0), 0);

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
      PAID: { variant: "success", label: t("paid") },
      PENDING: { variant: "warning", label: t("pending") },
      CANCELLED: { variant: "danger", label: t("cancelled") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const months = [
    { value: "1", label: t("january") },
    { value: "2", label: t("february") },
    { value: "3", label: t("march") },
    { value: "4", label: t("april") },
    { value: "5", label: t("may") },
    { value: "6", label: t("june") },
    { value: "7", label: t("july") },
    { value: "8", label: t("august") },
    { value: "9", label: t("september") },
    { value: "10", label: t("october") },
    { value: "11", label: t("november") },
    { value: "12", label: t("december") },
  ];

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: String(y), label: String(y) }));

  const paymentOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PAID", label: t("paid") },
    { value: "PENDING", label: t("pending") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setSelectedYear("");
    setPaymentFilter("");
  };

  const hasFilters = searchTerm || selectedMonth || selectedYear || paymentFilter;

  const columns: Column<any>[] = [
    {
      header: t("employee"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <User size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.employeeName}</span>
            <span className="text-xs text-gray-500">{item.employeeCode || item.employeeId?.slice(-8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t("base_salary"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{formatCurrency(item.basicSalary)}</span>
        </div>
      )
    },
    {
      header: t("allowances"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-green-600" />
          <span className="text-sm font-medium text-green-600">{formatCurrency(item.allowances)}</span>
        </div>
      )
    },
    {
      header: t("deductions"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-red-600" />
          <span className="text-sm font-medium text-red-600">- {formatCurrency(item.deductions)}</span>
        </div>
      )
    },
    {
      header: t("overtime"),
      render: (item) => (
        <span className="text-sm text-orange-600">{formatCurrency(item.overtimeAmount)}</span>
      )
    },
    {
      header: t("net_salary"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-indigo-600">{formatCurrency(item.netSalary)}</span>
          {getPaymentBadge(item.paymentStatus)}
        </div>
      )
    },
    {
      header: t("period"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {t(`month_${item.payrollMonth}`)} {item.payrollYear}
          </span>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("monthly_payroll_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_payroll_details_by_month")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={fetchData}
            className="border-gray-200"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </Button>
          <ExportDropdown data={filteredData} filename="monthly-payroll-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_employees")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_basic")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalBasicSalary)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_allowances")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalAllowances)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("total_deductions")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalDeductions)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_net")}</p>
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(totalNetSalary)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_by_employee")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">{t("all_months")}</option>
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">{t("all_years")}</option>
          {years.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

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
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => `${item.employeeId}-${item.payrollMonth}-${item.payrollYear}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};