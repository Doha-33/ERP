import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, TrendingUp, TrendingDown, 
  DollarSign, Users, BarChart3, 
  ArrowUp, ArrowDown, Minus, RefreshCw,
  Award, Target
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const SalaryTrendReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getSalaryTrendReport(selectedYear);
      setData(reportData);
    } catch (error) {
      console.error("Failed to fetch salary trend report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("default", { month: "short" });
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp size={14} className="text-green-600" />;
    if (change < 0) return <TrendingDown size={14} className="text-red-600" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const calculateMonthOverMonthChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }));

  const monthlyData = data?.monthly || [];
  const highestMonth = data?.highestMonth;
  const lowestMonth = data?.lowestMonth;

  // Calculate total for year
  const totalPayroll = monthlyData.reduce((sum: number, m: any) => sum + (m.totalNetSalary || 0), 0);
  const averageMonthlyPayroll = totalPayroll / (monthlyData.filter((m: any) => m.employeesCount > 0).length || 1);
  const peakMonth = monthlyData.reduce((max: any, m: any) => 
    (m.averageNetSalary || 0) > (max?.averageNetSalary || 0) ? m : max, {});

  const columns: Column<any>[] = [
    {
      header: t("month"),
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Calendar size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-900">{formatMonth(item.month)}</span>
        </div>
      )
    },
    {
      header: t("employees"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">{item.employeesCount || 0}</span>
        </div>
      )
    },
    {
      header: t("total_payroll"),
      render: (item) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-green-600" />
            <span className="text-sm font-bold text-green-600">{formatCurrency(item.totalNetSalary)}</span>
          </div>
          <span className="text-xs text-gray-400">{t("gross")}: {formatCurrency(item.totalGrossSalary)}</span>
        </div>
      )
    },
    {
      header: t("avg_salary"),
      render: (item, index) => {
        const avgSalary = item.averageNetSalary || 0;
        const prevAvg = index > 0 ? monthlyData[index - 1]?.averageNetSalary || 0 : 0;
        const change = calculateMonthOverMonthChange(avgSalary, prevAvg);
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-indigo-600">{formatCurrency(avgSalary)}</span>
              {index > 0 && (
                <div className="flex items-center gap-0.5">
                  {getTrendIcon(change)}
                  <span className={`text-xs ${getTrendColor(change)}`}>
                    {change !== 0 && change.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            <div className="w-20 mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min((avgSalary / (peakMonth?.averageNetSalary || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("salary_trend_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("analyze_salary_changes_and_averages_over_time")}
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
          <ExportDropdown data={monthlyData} filename={`salary-trend-${selectedYear}`} />
        </div>
      </div>

      {/* Year Filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("year")}</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {years.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_payroll")}</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalPayroll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_monthly_payroll")}</p>
              <p className="text-xl font-bold text-indigo-600">{formatCurrency(averageMonthlyPayroll)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Award size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("highest_month")}</p>
              <p className="text-xl font-bold text-orange-600">
                {highestMonth?.month ? formatMonth(highestMonth.month) : "-"}
              </p>
              <p className="text-xs text-gray-400">{formatCurrency(highestMonth?.averageNetSalary || 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("peak_avg_salary")}</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(peakMonth?.averageNetSalary || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      {highestMonth && lowestMonth && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">{t("year_summary")}</span>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("best_month")}</p>
                <p className="text-lg font-bold text-green-600">
                  {formatMonth(highestMonth.month)}
                </p>
                <p className="text-xs text-gray-400">{formatCurrency(highestMonth.averageNetSalary)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("worst_month")}</p>
                <p className="text-lg font-bold text-red-600">
                  {lowestMonth.month ? formatMonth(lowestMonth.month) : "-"}
                </p>
                <p className="text-xs text-gray-400">{formatCurrency(lowestMonth.averageNetSalary)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">{t("total_employees_served")}</p>
                <p className="text-lg font-bold text-indigo-600">
                  {monthlyData.reduce((sum: number, m: any) => sum + (m.employeesCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
        <Table
          data={monthlyData}
          columns={columns}
          keyExtractor={(item) => item.month}
          isLoading={isLoading}
          selectable
        />

      {/* Calculation Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">{t("note")}:</span> {t("salary_trend_note")}
        </p>
      </div>
    </div>
  );
};