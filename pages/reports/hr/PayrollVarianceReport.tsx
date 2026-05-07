import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, TrendingUp, TrendingDown, 
  DollarSign, Users, BarChart3, 
  ArrowUp, ArrowDown, Minus, RefreshCw,
  AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const PayrollVarianceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getPayrollVarianceReport(selectedYear, selectedMonth ? parseInt(selectedMonth) : undefined);
      setData(reportData);
    } catch (error) {
      console.error("Failed to fetch payroll variance report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });
  };

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} EGP`;
  };

  const formatPercentage = (percent: number) => {
    return `${percent?.toFixed(2) || 0}%`;
  };

  const getVariantColor = (trend: string) => {
    if (trend === "INCREASE") return "text-red-600";
    if (trend === "DECREASE") return "text-green-600";
    return "text-gray-500";
  };

  const getVariantIcon = (trend: string) => {
    if (trend === "INCREASE") return <TrendingUp size={16} className="text-red-600" />;
    if (trend === "DECREASE") return <TrendingDown size={16} className="text-green-600" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getVarianceBadge = (variance: number) => {
    if (variance > 0) return <Badge variant="danger">{t("increase")}</Badge>;
    if (variance < 0) return <Badge variant="success">{t("decrease")}</Badge>;
    return <Badge variant="info">{t("no_change")}</Badge>;
  };

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }));
  const months = [
    { value: "", label: t("all_months") },
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

  const current = data?.current;
  const previous = data?.previous;
  const variance = data?.variance;
  const currentMonth = data?.currentMonth;
  const previousMonth = data?.previousMonth;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("payroll_variance_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("compare_payroll_costs_between_periods")}
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
          <ExportDropdown data={data ? [data] : []} filename={`payroll-variance-${selectedYear}`} />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">{t("month")}</span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Summary */}
      {current && previous && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Period Card */}
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                {currentMonth ? `${formatMonth(currentMonth)} ${selectedYear}` : t("current_period")}
              </h3>
              <Badge variant="info" className="bg-blue-50 text-blue-700">
                {t("current")}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("employees_count")}</span>
                <span className="text-lg font-bold text-gray-900">{current.employeesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("total_gross")}</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(current.totalGross)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">{t("total_net")}</span>
                <span className="text-xl font-bold text-indigo-600">{formatCurrency(current.totalNet)}</span>
              </div>
            </div>
          </Card>

          {/* Previous Period Card */}
          <Card className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={20} className="text-indigo-600" />
                {previousMonth ? `${formatMonth(previousMonth)} ${selectedYear}` : t("previous_period")}
              </h3>
              <Badge variant="info" className="bg-gray-100 text-gray-700">
                {t("previous")}
              </Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("employees_count")}</span>
                <span className="text-lg font-bold text-gray-900">{previous.employeesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("total_gross")}</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(previous.totalGross)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">{t("total_net")}</span>
                <span className="text-xl font-bold text-indigo-600">{formatCurrency(previous.totalNet)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Variance Analysis */}
      {variance && (
        <Card className="bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            {t("variance_analysis")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gross Variance */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{t("gross_variance")}</span>
                <div className="flex items-center gap-2">
                  {getVariantIcon(variance.trend)}
                  <span className={`text-lg font-bold ${getVariantColor(variance.trend)}`}>
                    {formatCurrency(variance.grossVariance)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{t("percentage_change")}</span>
                <span className={`text-sm font-medium ${getVariantColor(variance.trend)}`}>
                  {formatPercentage(variance.grossVariancePercent)}
                </span>
              </div>
              <div className="mt-3">
                {getVarianceBadge(variance.grossVariance)}
              </div>
            </div>

            {/* Net Variance */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{t("net_variance")}</span>
                <div className="flex items-center gap-2">
                  {getVariantIcon(variance.trend)}
                  <span className={`text-lg font-bold ${getVariantColor(variance.trend)}`}>
                    {formatCurrency(variance.netVariance)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{t("percentage_change")}</span>
                <span className={`text-sm font-medium ${getVariantColor(variance.trend)}`}>
                  {formatPercentage(variance.netVariancePercent)}
                </span>
              </div>
              <div className="mt-3">
                {getVarianceBadge(variance.netVariance)}
              </div>
            </div>
          </div>

          {/* Trend Indicator */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{t("overall_trend")}</span>
              <div className="flex items-center gap-2">
                {getVariantIcon(variance.trend)}
                <span className={`font-bold ${getVariantColor(variance.trend)}`}>
                  {variance.trend === "INCREASE" ? t("increase") : variance.trend === "DECREASE" ? t("decrease") : t("stable")}
                </span>
              </div>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  variance.trend === "INCREASE" ? "bg-red-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(Math.abs(variance.netVariancePercent), 100)}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">{t("note")}:</span> {t("payroll_variance_note")}
        </p>
      </div>
    </div>
  );
};