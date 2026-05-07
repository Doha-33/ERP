import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, User, Filter, X, 
  RefreshCw, Users, TrendingUp, Award 
} from "lucide-react";
import { Card, Button, Badge, ExportDropdown, Input } from "../../../components/ui/Common";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const LeaveReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getLeaveReport();
      // Transform data to match expected format
      const transformedData = reportData.map((item: any) => ({
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        leaveType: item.leaveType,
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : "-",
        endDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : "-",
        totalDays: item.totalDays || item.days || 0,
        status: item.status || "PENDING",
        approver: item.approver || "-",
        balanceAfterLeave: item.balanceAfterLeave || 0,
      }));
      setData(transformedData);
    } catch (error) {
      console.error("Failed to fetch leave report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setLoading(false);
    }
  };

  // Get unique leave types for filter
  const uniqueLeaveTypes = useMemo(() => {
    const types = data.map(r => r.leaveType).filter(Boolean);
    return Array.from(new Set(types));
  }, [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = 
        item.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLeaveType = !leaveTypeFilter || item.leaveType === leaveTypeFilter;
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      const itemStartDate = item.startDate;
      const matchesDateFrom = !dateFrom || itemStartDate >= new Date(dateFrom).toLocaleDateString();
      const matchesDateTo = !dateTo || itemStartDate <= new Date(dateTo).toLocaleDateString();
      
      return matchesSearch && matchesLeaveType && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [data, searchTerm, leaveTypeFilter, statusFilter, dateFrom, dateTo]);

  // Statistics
  const totalLeaves = filteredData.length;
  const totalDays = filteredData.reduce((sum, item) => sum + (item.totalDays || 0), 0);
  const pendingCount = filteredData.filter(item => item.status === "PENDING").length;
  const approvedCount = filteredData.filter(item => item.status === "APPROVED").length;
  const rejectedCount = filteredData.filter(item => item.status === "REJECTED").length;

  const getLeaveTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      ANNUAL: t("annual_leave"),
      SICK: t("sick_leave"),
      UNPAID: t("unpaid_leave"),
      EMERGENCY: t("emergency_leave"),
      MATERNITY: t("maternity_leave"),
      OTHER: t("other_leave"),
    };
    return typeMap[type] || type;
  };

  const getLeaveTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: "info" | "success" | "warning" | "danger" | "purple"; label: string }> = {
      ANNUAL: { variant: "info", label: t("annual_leave") },
      SICK: { variant: "warning", label: t("sick_leave") },
      UNPAID: { variant: "danger", label: t("unpaid_leave") },
      EMERGENCY: { variant: "purple", label: t("emergency_leave") },
      MATERNITY: { variant: "success", label: t("maternity_leave") },
      OTHER: { variant: "neutral", label: t("other_leave") },
    };
    const config = typeMap[type] || { variant: "info", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "warning" | "success" | "danger" | "info"; label: string }> = {
      PENDING: { variant: "warning", label: t("pending") },
      APPROVED: { variant: "success", label: t("approved") },
      REJECTED: { variant: "danger", label: t("rejected") },
    };
    const config = statusMap[status] || { variant: "info", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const leaveTypeOptions = [
    { value: "", label: t("all_leave_types") },
    ...uniqueLeaveTypes.map(type => ({ value: type, label: getLeaveTypeLabel(type) })),
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "PENDING", label: t("pending") },
    { value: "APPROVED", label: t("approved") },
    { value: "REJECTED", label: t("rejected") },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setLeaveTypeFilter("");
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || leaveTypeFilter || statusFilter || dateFrom || dateTo;

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
      header: t("leave_type"),
      render: (item) => getLeaveTypeBadge(item.leaveType)
    },
    {
      header: t("period"),
      render: (item) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-600">{item.startDate}</span>
            <span className="text-gray-400">→</span>
            <span className="text-xs text-gray-600">{item.endDate}</span>
          </div>
          <span className="text-xs text-gray-500">{t("days")}: {item.totalDays}</span>
        </div>
      )
    },
    {
      header: t("balance"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <Award size={14} className="text-blue-500" />
          <span className="text-sm font-medium text-blue-600">{item.balanceAfterLeave} {t("days")}</span>
        </div>
      )
    },
    {
      header: t("approver"),
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <User size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{item.approver}</span>
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
            {t("leave_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_leave_history_and_details")}
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
          <ExportDropdown data={filteredData} filename="leave-report" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            <p className="text-xs text-gray-500">{t("total_leave_requests")}</p>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalLeaves}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <p className="text-xs text-gray-500">{t("total_days")}</p>
          </div>
          <p className="text-xl font-bold text-blue-600 mt-1">{totalDays}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-600" />
            <p className="text-xs text-gray-500">{t("pending")}</p>
          </div>
          <p className="text-xl font-bold text-orange-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            <p className="text-xs text-gray-500">{t("approved")}</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-red-600" />
            <p className="text-xs text-gray-500">{t("rejected")}</p>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedCount}</p>
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
          value={leaveTypeFilter}
          onChange={(e) => setLeaveTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {leaveTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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

      {/* Table */}
        <Table
          data={filteredData}
          columns={columns}
          keyExtractor={(item, index) => `${item.employeeName}-${item.startDate}-${index}`}
          isLoading={loading}
          selectable
        />
    </div>
  );
};

// Add missing imports
import { Clock, CheckCircle, XCircle } from "lucide-react";