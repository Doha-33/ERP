import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Calendar, Users, TrendingUp, TrendingDown,
  UserPlus, UserMinus, RefreshCw, Filter,
  X, BarChart3, PieChart, ArrowRight
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const TurnoverReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, [dateFrom, dateTo]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getTurnoverReport({ fromDate: dateFrom, toDate: dateTo });
      // Transform data to match expected format
      setData({
        fromDate: reportData.fromDate,
        toDate: reportData.toDate,
        totalEmployeesAtStart: reportData.totalEmployeesAtStart || 0,
        currentEmployees: reportData.currentEmployees || 0,
        terminatedEmployees: reportData.terminatedEmployees || 0,
        turnoverRate: parseFloat(reportData.turnoverRate) || 0,
        newHires: reportData.newHires || 0,
      });
    } catch (error) {
      console.error("Failed to fetch turnover report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const getTurnoverColor = (rate: number) => {
    if (rate > 20) return "text-red-600";
    if (rate > 10) return "text-orange-600";
    return "text-green-600";
  };

  const getTurnoverBgColor = (rate: number) => {
    if (rate > 20) return "bg-red-100 border-red-200";
    if (rate > 10) return "bg-orange-100 border-orange-200";
    return "bg-green-100 border-green-200";
  };

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("turnover_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("analyze_employee_turnover_rates_and_trends")}
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
          <ExportDropdown data={data ? [data] : []} filename="turnover-report" />
        </div>
      </div>

      {/* Period Summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-indigo-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{t("period")}:</span>
              <span className="text-sm text-gray-900">
                {formatDate(dateFrom) || t("all_time")} <ArrowRight size={14} className="inline mx-1" /> {formatDate(dateTo) || t("present")}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder={t("from_date")}
              className="w-36"
              fullWidth={false}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder={t("to_date")}
              className="w-36"
              fullWidth={false}
            />
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                {t("clear_filters")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("starting_headcount")}</p>
              <p className="text-xl font-bold text-gray-900">{data?.totalEmployeesAtStart || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <UserPlus size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("new_hires")}</p>
              <p className="text-xl font-bold text-green-600">{data?.newHires || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <UserMinus size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("separations")}</p>
              <p className="text-xl font-bold text-red-600">{data?.terminatedEmployees || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("current_headcount")}</p>
              <p className="text-xl font-bold text-indigo-600">{data?.currentEmployees || 0}</p>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-4 shadow-sm border ${getTurnoverBgColor(data?.turnoverRate || 0)}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className={getTurnoverColor(data?.turnoverRate || 0)} />
            </div>
            <div>
              <p className="text-xs text-gray-600">{t("turnover_rate")}</p>
              <p className={`text-xl font-bold ${getTurnoverColor(data?.turnoverRate || 0)}`}>
                {formatRate(data?.turnoverRate || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Turnover Rate Visualization */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            {t("turnover_analysis")}
          </h3>
          <div className="space-y-6">
            {/* Turnover Rate Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{t("turnover_rate")}</span>
                <span className={`text-sm font-bold ${getTurnoverColor(data?.turnoverRate || 0)}`}>
                  {formatRate(data?.turnoverRate || 0)}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (data?.turnoverRate || 0) > 20 ? "bg-red-500" : 
                    (data?.turnoverRate || 0) > 10 ? "bg-orange-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(data?.turnoverRate || 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Retention Rate Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{t("retention_rate")}</span>
                <span className="text-sm font-bold text-blue-600">
                  {formatRate(100 - (data?.turnoverRate || 0))}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100 - (data?.turnoverRate || 0), 100)}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{data?.totalEmployeesAtStart || 0}</p>
                <p className="text-xs text-gray-500">{t("start_count")}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <UserPlus size={14} className="text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{data?.newHires || 0}</p>
                </div>
                <p className="text-xs text-gray-500">{t("hired")}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <UserMinus size={14} className="text-red-600" />
                  <p className="text-2xl font-bold text-red-600">{data?.terminatedEmployees || 0}</p>
                </div>
                <p className="text-xs text-gray-500">{t("left")}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{data?.currentEmployees || 0}</p>
                <p className="text-xs text-gray-500">{t("end_count")}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">{t("calculation_note")}:</span> {t("turnover_rate_calculation_note")}
        </p>
      </div>
    </div>
  );
};