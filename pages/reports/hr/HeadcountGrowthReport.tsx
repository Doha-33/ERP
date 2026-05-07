import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, TrendingUp, TrendingDown, 
  UserPlus, UserMinus, Users, BarChart3,
  RefreshCw, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const HeadcountGrowthReport: React.FC = () => {
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
      const reportData = await hrService.getHeadcountGrowthReport(selectedYear);
      setData(reportData);
    } catch (error) {
      console.error("Failed to fetch headcount growth report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString("default", { month: "short" });
  };

  const getGrowthIcon = (netGrowth: number) => {
    if (netGrowth > 0) return <ArrowUp size={14} className="text-green-600" />;
    if (netGrowth < 0) return <ArrowDown size={14} classname="text-red-600" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getGrowthColor = (netGrowth: number) => {
    if (netGrowth > 0) return "text-green-600";
    if (netGrowth < 0) return "text-red-600";
    return "text-gray-500";
  };

  const formatNumber = (num: number) => {
    return num?.toLocaleString() || 0;
  };

  const calculateTotalHired = () => {
    return data?.monthly?.reduce((sum: number, m: any) => sum + (m.hired || 0), 0) || 0;
  };

  const calculateTotalTerminated = () => {
    return data?.monthly?.reduce((sum: number, m: any) => sum + (m.terminated || 0), 0) || 0;
  };

  const calculateNetGrowth = () => {
    return calculateTotalHired() - calculateTotalTerminated();
  };

  const getAverageMonthlyGrowth = () => {
    const total = data?.monthly?.reduce((sum: number, m: any) => sum + (m.netGrowth || 0), 0) || 0;
    const months = data?.monthly?.length || 1;
    return total / months;
  };

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }));

  const monthlyData = data?.monthly || [];

  const columns: Column<any>[] = [
    {
      header: t("month"),
      render: (item, index) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Calendar size={14} className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-900">{formatMonth(item.month)}</span>
        </div>
      )
    },
    {
      header: t("hires"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <UserPlus size={14} className="text-green-600" />
          <span className="text-sm font-semibold text-green-600">{formatNumber(item.hired)}</span>
        </div>
      )
    },
    {
      header: t("separations"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <UserMinus size={14} className="text-red-600" />
          <span className="text-sm font-semibold text-red-600">{formatNumber(item.terminated)}</span>
        </div>
      )
    },
    {
      header: t("net_growth"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {getGrowthIcon(item.netGrowth)}
          <span className={`text-sm font-bold ${getGrowthColor(item.netGrowth)}`}>
            {formatNumber(item.netGrowth)}
          </span>
        </div>
      )
    },
    {
      header: t("cumulative"),
      render: (item, index) => {
        let cumulative = 0;
        for (let i = 0; i <= index; i++) {
          cumulative += monthlyData[i]?.netGrowth || 0;
        }
        const startHeadcount = data?.currentHeadcount - cumulative + (monthlyData[index]?.netGrowth || 0);
        const currentHeadcount = startHeadcount;
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{formatNumber(currentHeadcount)}</span>
            <div className="w-16 h-1 mt-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min((currentHeadcount / (data?.currentHeadcount || 1)) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
  ];

  const totalHired = calculateTotalHired();
  const totalTerminated = calculateTotalTerminated();
  const netGrowth = calculateNetGrowth();
  const avgMonthlyGrowth = getAverageMonthlyGrowth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("headcount_growth_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("track_headcount_changes_over_time")}
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
          <ExportDropdown data={monthlyData} filename={`headcount-growth-${selectedYear}`} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("current_headcount")}</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(data?.currentHeadcount)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <UserPlus size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_hires")}</p>
              <p className="text-xl font-bold text-green-600">{formatNumber(totalHired)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <UserMinus size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_separations")}</p>
              <p className="text-xl font-bold text-red-600">{formatNumber(totalTerminated)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("net_growth")}</p>
              <p className={`text-xl font-bold ${netGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNumber(netGrowth)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("avg_monthly_growth")}</p>
              <p className={`text-xl font-bold ${avgMonthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNumber(avgMonthlyGrowth)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{t("year_overview")}</span>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">{t("start_headcount")}</p>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber((data?.currentHeadcount || 0) - netGrowth)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">{t("end_headcount")}</p>
              <p className="text-lg font-bold text-indigo-600">{formatNumber(data?.currentHeadcount)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">{t("net_change")}</p>
              <p className={`text-lg font-bold ${netGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatNumber(netGrowth)}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          <span className="font-medium">{t("note")}:</span> {t("headcount_growth_note")}
        </p>
      </div>
    </div>
  );
};