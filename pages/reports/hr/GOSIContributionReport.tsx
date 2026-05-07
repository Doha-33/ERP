import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, DollarSign, TrendingUp, 
  User, Building2, Filter, X, RefreshCw, 
  Users, Shield, TrendingDown
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const GOSIContributionReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getGosiReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeName: item.employeeName,
        employeeId: item.employeeId,
        employeeCode: item.employeeCode,
        nationality: item.nationality || "N/A",
        gosiId: item.gosiId || "-",
        basicSalary: item.basicSalary || 0,
        employeeContribution: item.employeeContribution || 0,
        employerContribution: item.employerContribution || 0,
        totalContribution: item.total || 0,
        month: item.month,
        year: item.year,
        status: item.status || "PENDING",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch GOSI report:", error);
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
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gosiId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMonth = !selectedMonth || item.month === parseInt(selectedMonth);
      const matchesYear = !selectedYear || item.year === parseInt(selectedYear);
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [data, searchTerm, selectedMonth, selectedYear, statusFilter]);

  // Statistics
  const totalEmployees = filteredData.length;
  const totalEmployeeContrib = filteredData.reduce((sum, item) => sum + (item.employeeContribution || 0), 0);
  const totalEmployerContrib = filteredData.reduce((sum, item) => sum + (item.employerContribution || 0), 0);
  const totalContrib = filteredData.reduce((sum, item) => sum + (item.totalContribution || 0), 0);
  const totalBasicSalary = filteredData.reduce((sum, item) => sum + (item.basicSalary || 0), 0);
  const averageContribution = totalEmployees > 0 ? totalContrib / totalEmployees : 0;

  const getStatusBadge = (status: string) => {
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

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PAID", label: t("paid") },
    { value: "PENDING", label: t("pending") },
    { value: "CANCELLED", label: t("cancelled") },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedMonth("");
    setSelectedYear("");
    setStatusFilter("");
  };

  const hasFilters = searchTerm || selectedMonth || selectedYear || statusFilter;

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
      header: t("gosi_info"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Shield size={14} className="text-blue-600" />
            <span className="text-sm font-mono text-gray-600">{item.gosiId}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">{item.nationality}</span>
          </div>
        </div>
      )
    },
    {
      header: t("salary"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{formatCurrency(item.basicSalary)}</span>
        </div>
      )
    },
    {
      header: t("contributions"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-green-600" />
            <span className="text-xs text-green-600">{t("employee")}: {formatCurrency(item.employeeContribution)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingDown size={12} className="text-orange-600" />
            <span className="text-xs text-orange-600">{t("employer")}: {formatCurrency(item.employerContribution)}</span>
          </div>
        </div>
      )
    },
    {
      header: t("total"),
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-indigo-600">{formatCurrency(item.totalContribution)}</span>
          <span className="text-xs text-gray-400">
            {t("rate")}: {item.basicSalary > 0 ? Math.round((item.totalContribution / item.basicSalary) * 100) : 0}%
          </span>
        </div>
      )
    },
    {
      header: t("period"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {t(`month_${item.month}`)} {item.year}
          </span>
        </div>
      )
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.status)
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("gosi_contribution_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_gosi_contributions_for_all_employees")}
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
          <ExportDropdown data={filteredData} filename="gosi-contribution-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_employees")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_basic_salary")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{formatCurrency(totalBasicSalary)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_employee_contrib")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalEmployeeContrib)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("total_employer_contrib")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalEmployerContrib)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_contributions")}</p>
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-1">{formatCurrency(totalContrib)}</p>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {statusOptions.map((option) => (
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("average_contribution_per_employee")}</span>
          </div>
          <span className="text-xl font-bold text-indigo-600">{formatCurrency(averageContribution)}</span>
        </div>
      </div>

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item) => `${item.employeeId}-${item.month}-${item.year}`}
          isLoading={isLoading}
          selectable
        />
    </div>
  );
};