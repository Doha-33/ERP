import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, Clock, User, 
  TrendingDown, AlertCircle, CheckCircle, 
  Filter, X, RefreshCw, Users 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const AttendanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getAttendanceReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        date: item.date ? new Date(item.date).toLocaleDateString() : "-",
        totalHours: item.totalHours || 0,
        lateInMinutes: item.lateInMinutes || 0,
        earlyOut: item.earlyOut || false,
        overtime: item.overtime || 0,
        status: item.status || "PRESENT",
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch attendance report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      const itemDate = item.date;
      const matchesDateFrom = !dateFrom || itemDate >= new Date(dateFrom).toLocaleDateString();
      const matchesDateTo = !dateTo || itemDate <= new Date(dateTo).toLocaleDateString();
      
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [data, searchTerm, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalRecords = filteredData.length;
  const presentCount = filteredData.filter(item => item.status === "PRESENT").length;
  const absentCount = filteredData.filter(item => item.status === "ABSENT").length;
  const lateCount = filteredData.filter(item => item.lateInMinutes > 0).length;
  const totalLateMinutes = filteredData.reduce((sum, item) => sum + (item.lateInMinutes || 0), 0);
  const totalOvertimeHours = filteredData.reduce((sum, item) => sum + (item.overtime || 0), 0);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "success" | "danger" | "warning" | "info"; label: string; icon: any }> = {
      PRESENT: { variant: "success", label: t("present"), icon: CheckCircle },
      ABSENT: { variant: "danger", label: t("absent"), icon: AlertCircle },
      LATE: { variant: "warning", label: t("late"), icon: Clock },
      PERMISSION: { variant: "info", label: t("permission"), icon: Clock },
    };
    const config = statusMap[status] || { variant: "info", label: status, icon: null };
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon size={12} />}
        {config.label}
      </Badge>
    );
  };

  const getLateBadge = (minutes: number) => {
    if (minutes === 0) return null;
    if (minutes <= 15) return <Badge variant="warning" className="text-xs">{minutes} min</Badge>;
    return <Badge variant="danger" className="text-xs">{minutes} min</Badge>;
  };

  const formatDuration = (hours: number) => {
    return `${hours.toFixed(1)} h`;
  };

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PRESENT", label: t("present") },
    { value: "ABSENT", label: t("absent") },
    { value: "LATE", label: t("late") },
    { value: "PERMISSION", label: t("permission") },
  ];

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
            <span className="text-xs text-gray-500">{item.employeeCode || "-"}</span>
          </div>
        </div>
      )
    },
    {
      header: t("date"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{item.date}</span>
        </div>
      )
    },
    {
      header: t("attendance"),
      render: (item) => {
        const presence = item.totalHours > 0 ? item.totalHours : 8;
        const maxHours = 8;
        const percentage = (presence / maxHours) * 100;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span className="text-sm font-medium">{formatDuration(presence)} / {formatDuration(maxHours)}</span>
            </div>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      header: t("late"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {getLateBadge(item.lateInMinutes) || <span className="text-sm text-green-600">-</span>}
        </div>
      )
    },
    {
      header: t("overtime"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <TrendingDown size={14} className="text-green-600" />
          <span className="text-sm font-medium text-green-600">{formatDuration(item.overtime)}</span>
        </div>
      )
    },
    {
      header: t("status"),
      render: (item) => getStatusBadge(item.status)
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || statusFilter || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("attendance_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_attendance_summary")}
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
          <ExportDropdown data={filteredData} filename="attendance-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_records")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("present")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("absent")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{absentCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("total_late_minutes")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{totalLateMinutes} min</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("total_overtime")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{formatDuration(totalOvertimeHours)}</p>
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

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item, index) => `${item.employeeName}-${item.date}-${index}`}
          isLoading={loading}
          selectable
        />
    </div>
  );
};