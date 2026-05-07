import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, TrendingUp, TrendingDown,
  Users, Filter, X, RefreshCw, User,
  AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const LeaveBalanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const reportData = await hrService.getLeaveBalanceReport(selectedYear);
      // Transform data to match expected format
      const transformedData = reportData.employees?.map((item: any) => ({
        employeeId: item.employeeId,
        employeeCode: item.employeeCode,
        employeeName: item.employeeName,
        annualBalance: item.annualBalance || 0,
        usedDays: item.usedDays || 0,
        pendingDays: item.pendingDays || 0,
        remainingBalance: item.remainingBalance || 0,
        departmentName: item.departmentName || "-",
      })) || [];
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch leave balance report:", error);
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
      return matchesSearch;
    });
  }, [data, searchTerm]);

  // Statistics
  const totalEmployees = filteredData.length;
  const totalRemaining = filteredData.reduce((sum, item) => sum + (item.remainingBalance || 0), 0);
  const totalUsed = filteredData.reduce((sum, item) => sum + (item.usedDays || 0), 0);
  const totalPending = filteredData.reduce((sum, item) => sum + (item.pendingDays || 0), 0);
  const criticalBalanceCount = filteredData.filter(item => (item.remainingBalance || 0) < 5).length;
  const negativeBalanceCount = filteredData.filter(item => (item.remainingBalance || 0) < 0).length;

  const getBalanceStatus = (balance: number) => {
    if (balance < 0) {
      return { label: t("negative"), variant: "danger" as const, icon: AlertCircle };
    }
    if (balance < 5) {
      return { label: t("critical"), variant: "warning" as const, icon: AlertCircle };
    }
    if (balance < 10) {
      return { label: t("low"), variant: "info" as const, icon: Clock };
    }
    return { label: t("good"), variant: "success" as const, icon: CheckCircle };
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return "text-red-600";
    if (balance < 5) return "text-orange-600";
    if (balance < 10) return "text-yellow-600";
    return "text-green-600";
  };

  const years = [2023, 2024, 2025, 2026, 2027].map(y => ({ value: y, label: String(y) }));

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
            <span className="text-xs text-gray-500">{item.employeeCode}</span>
          </div>
        </div>
      )
    },
    {
      header: t("department"),
      render: (item) => (
        <Badge variant="info" className="bg-gray-100 text-gray-700">
          {item.departmentName}
        </Badge>
      )
    },
    {
      header: t("annual_balance"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">{item.annualBalance} {t("days")}</span>
        </div>
      )
    },
    {
      header: t("used"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-orange-600" />
          <span className="text-sm font-medium text-orange-600">{item.usedDays} {t("days")}</span>
        </div>
      )
    },
    {
      header: t("pending"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-yellow-600" />
          <span className="text-sm font-medium text-yellow-600">{item.pendingDays} {t("days")}</span>
        </div>
      )
    },
    {
      header: t("remaining"),
      render: (item) => {
        const status = getBalanceStatus(item.remainingBalance);
        const StatusIcon = status.icon;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <StatusIcon size={14} className={getBalanceColor(item.remainingBalance)} />
              <span className={`text-sm font-bold ${getBalanceColor(item.remainingBalance)}`}>
                {item.remainingBalance} {t("days")}
              </span>
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  item.remainingBalance < 0 ? "bg-red-500" :
                  item.remainingBalance < 5 ? "bg-orange-500" :
                  item.remainingBalance < 10 ? "bg-yellow-500" : "bg-green-500"
                }`}
                style={{ width: `${Math.min(Math.abs(item.remainingBalance / item.annualBalance) * 100, 100)}%` }}
              />
            </div>
          </div>
        );
      }
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
            {t("leave_balance_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_remaining_leave_balances_for_all_employees")}
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
          <ExportDropdown data={filteredData} filename={`leave-balance-${selectedYear}`} />
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
              <p className="text-xs text-gray-500">{t("total_employees")}</p>
              <p className="text-xl font-bold text-gray-900">{totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_remaining")}</p>
              <p className="text-xl font-bold text-green-600">{totalRemaining} {t("days")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_used")}</p>
              <p className="text-xl font-bold text-orange-600">{totalUsed} {t("days")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("total_pending")}</p>
              <p className="text-xl font-bold text-yellow-600">{totalPending} {t("days")}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle size={18} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{t("negative_balance")}</p>
              <p className="text-xl font-bold text-red-600">{negativeBalanceCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for critical balances */}
      {criticalBalanceCount > 0 && (
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-orange-600" />
            <span className="text-sm text-orange-700">
              {t("critical_balance_alert", { count: criticalBalanceCount })}
            </span>
          </div>
        </div>
      )}

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
          keyExtractor={(item) => item.employeeId}
          isLoading={isLoading}
          selectable
        />

      {/* Note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <p className="text-xs text-gray-500">
          <span className="font-medium">{t("note")}:</span> {t("leave_balance_note")}
        </p>
      </div>
    </div>
  );
};