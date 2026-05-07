import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Building2, DollarSign, TrendingUp, TrendingDown,
  Users, Calendar, RefreshCw, Filter, X,
  PieChart, BarChart3,
  Search
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const AnnualPayrollCostReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("totalAnnualPayroll");

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getAnnualPayrollCostReport(selectedYear);
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        departmentName: item.departmentName || "Unknown",
        totalAnnualPayroll: item.totalAnnualPayroll || 0,
        totalAllowances: item.totalAllowances || 0,
        totalDeductions: item.totalDeductions || 0,
        numberOfEmployees: item.numberOfEmployees || 0,
        averageCostPerEmployee: item.averageCostPerEmployee || 0,
        year: item.year || selectedYear,
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch annual payroll cost report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortBy === "departmentName") {
        return a.departmentName.localeCompare(b.departmentName);
      }
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    });
  }, [data, sortBy]);

  // Apply search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return sortedData;
    return sortedData.filter(item =>
      item.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedData, searchTerm]);

  // Statistics
  const totalDepartments = filteredData.length;
  const totalEmployees = filteredData.reduce((sum, item) => sum + (item.numberOfEmployees || 0), 0);
  const totalPayroll = filteredData.reduce((sum, item) => sum + (item.totalAnnualPayroll || 0), 0);
  const totalAllowances = filteredData.reduce((sum, item) => sum + (item.totalAllowances || 0), 0);
  const totalDeductions = filteredData.reduce((sum, item) => sum + (item.totalDeductions || 0), 0);
  const averagePayroll = totalDepartments > 0 ? totalPayroll / totalDepartments : 0;

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const getCostPercentage = (amount: number) => {
    if (totalPayroll === 0) return 0;
    return (amount / totalPayroll) * 100;
  };

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }));

  const sortOptions = [
    { value: "totalAnnualPayroll", label: t("total_payroll") },
    { value: "numberOfEmployees", label: t("number_of_employees") },
    { value: "averageCostPerEmployee", label: t("avg_per_employee") },
    { value: "departmentName", label: t("department_name") },
  ];

  const columns: Column<any>[] = [
    {
      header: t("department"),
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Building2 size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{item.departmentName}</span>
            <span className="text-xs text-gray-500">{item.numberOfEmployees} {t("employees")}</span>
          </div>
        </div>
      )
    },
    {
      header: t("total_payroll"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-bold text-green-600">{formatCurrency(item.totalAnnualPayroll)}</span>
          </div>
          <div className="w-24 mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${getCostPercentage(item.totalAnnualPayroll)}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: t("allowances"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{formatCurrency(item.totalAllowances)}</span>
        </div>
      )
    },
    {
      header: t("deductions"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-red-600" />
          <span className="text-sm font-medium text-red-600">- {formatCurrency(item.totalDeductions)}</span>
        </div>
      )
    },
    {
      header: t("net_cost"),
      render: (item) => (
        <span className="text-sm font-semibold text-indigo-600">
          {formatCurrency(item.totalAnnualPayroll - item.totalDeductions)}
        </span>
      )
    },
    {
      header: t("avg_per_employee"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700">{formatCurrency(item.averageCostPerEmployee)}</span>
        </div>
      )
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
  };

  const hasFilters = searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("annual_payroll_cost_by_department")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_payroll_costs_grouped_by_department")}
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
          <ExportDropdown data={filteredData} filename={`annual-payroll-cost-${selectedYear}`} />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_departments")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalDepartments}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_employees")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalEmployees.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_payroll")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalPayroll)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_allowances")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalAllowances)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("total_deductions")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalDeductions)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("search_department")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sortOptions.map((option) => (
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

      {/* Summary Row */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("average_payroll_per_department")}</span>
          </div>
          <span className="text-xl font-bold text-indigo-600">{formatCurrency(averagePayroll)}</span>
        </div>
      </div>

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => item.departmentName}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};