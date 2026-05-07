import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, Clock, AlertTriangle, 
  CheckCircle, XCircle, RefreshCw, Download, 
  X, User, Briefcase, Building2, Filter
} from "lucide-react";
import { Table, Column } from "../../../components/ui/Table";
import { Badge } from "../../../components/ui/Common";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";

export const ExpiredContractsReport: React.FC = () => {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [days, setDays] = useState(60);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hrService.getContractsExpiryReport(days);
      
      let contractsData = [];
      if (response?.data) {
        contractsData = response.data;
      } else if (response?.success && response?.data) {
        contractsData = response.data;
      } else if (Array.isArray(response)) {
        contractsData = response;
      } else {
        contractsData = [];
      }
      
      setContracts(contractsData);
    } catch (error) {
      console.error("Failed to fetch contracts expiry report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const departments = contracts.map(c => c.departmentName).filter(Boolean);
    return Array.from(new Set(departments));
  }, [contracts]);

  // Apply filters
  const filteredData = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = 
        contract.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !departmentFilter || contract.departmentName === departmentFilter;
      
      const daysRemaining = contract.daysRemaining || 0;
      let matchesStatus = true;
      if (statusFilter === "expired") matchesStatus = daysRemaining < 0;
      else if (statusFilter === "expiring_soon") matchesStatus = daysRemaining >= 0 && daysRemaining <= 30;
      else if (statusFilter === "active") matchesStatus = daysRemaining > 30;
      
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [contracts, searchTerm, departmentFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = contracts.length;
    const expired = contracts.filter(c => (c.daysRemaining || 0) < 0).length;
    const expiringSoon = contracts.filter(c => (c.daysRemaining || 0) >= 0 && (c.daysRemaining || 0) <= 30).length;
    const active = contracts.filter(c => (c.daysRemaining || 0) > 30).length;
    
    return { total, expired, expiringSoon, active };
  }, [contracts]);

  const columns: Column<any>[] = [
    {
      header: t("employee"),
      render: (contract) => (
        <div className="flex items-center gap-3">
          {contract.avatar ? (
            <img 
              src={contract.avatar} 
              alt={contract.employeeName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <User size={18} className="text-indigo-600" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {contract.employeeName}
            </span>
            <span className="text-xs text-gray-500">
              {contract.employeeCode}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("department"),
      render: (contract) => (
        <div className="flex items-center gap-1.5">
          <Building2 size={14} className="text-blue-500" />
          <span className="text-sm text-gray-700">{contract.departmentName || "-"}</span>
        </div>
      )
    },
    {
      header: t("job_title"),
      render: (contract) => (
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-purple-500" />
          <span className="text-sm text-gray-700">{contract.jobTitle || "-"}</span>
        </div>
      )
    },
    {
      header: t("contract_period"),
      render: (contract) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{t("from")}:</span>
            <span className="text-xs text-gray-700">{contract.startDate}</span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">{t("to")}:</span>
            <span className="text-xs text-gray-700 font-medium">{contract.endDate}</span>
          </div>
        </div>
      )
    },
    {
      header: t("days_remaining"),
      render: (contract) => {
        const days = contract.daysRemaining || 0;
        let colorClass = "text-gray-600";
        let bgClass = "bg-gray-100";
        
        if (days < 0) {
          colorClass = "text-red-600 font-bold";
          bgClass = "bg-red-100";
        } else if (days <= 30) {
          colorClass = "text-orange-600 font-semibold";
          bgClass = "bg-orange-100";
        } else {
          colorClass = "text-green-600";
          bgClass = "bg-green-100";
        }
        
        return (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgClass}`}>
            <Clock size={14} className={days < 0 ? "text-red-500" : days <= 30 ? "text-orange-500" : "text-green-500"} />
            <span className={`text-sm ${colorClass}`}>
              {Math.abs(days)} {t("days")} {days < 0 ? t("ago") : t("remaining")}
            </span>
          </div>
        );
      }
    },
    {
      header: t("status"),
      render: (contract) => {
        const days = contract.daysRemaining || 0;
        let variant: "danger" | "warning" | "success" = "success";
        let icon = null;
        let label = "";
        
        if (days < 0) {
          variant = "danger";
          icon = <XCircle size={14} className="mr-1" />;
          label = t("expired");
        } else if (days <= 30) {
          variant = "warning";
          icon = <AlertTriangle size={14} className="mr-1" />;
          label = t("expiring_soon");
        } else {
          variant = "success";
          icon = <CheckCircle size={14} className="mr-1" />;
          label = t("active");
        }
        
        return (
          <Badge variant={variant} className="flex items-center">
            {icon}
            {label}
          </Badge>
        );
      }
    },
  ];

  const departmentOptions = [
    { value: "", label: t("all_departments") },
    ...uniqueDepartments.map(dept => ({ value: dept, label: dept })),
  ];

  const statusOptions = [
    { value: "", label: t("all_statuses") },
    { value: "expired", label: t("expired") },
    { value: "expiring_soon", label: t("expiring_soon") },
    { value: "active", label: t("active") },
  ];

  const daysOptions = [
    { value: 30, label: `30 ${t("days")}` },
    { value: 60, label: `60 ${t("days")}` },
    { value: 90, label: `90 ${t("days")}` },
    { value: 180, label: `180 ${t("days")}` },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setDepartmentFilter("");
    setStatusFilter("");
  };

  const hasFilters = searchTerm || departmentFilter || statusFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("expired_contracts_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("view_contracts_nearing_expiration")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            {t("refresh")}
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={18} />
            {t("export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contracts Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_contracts")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Briefcase size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        {/* Active Contracts Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("active_contracts")}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Expiring Soon Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("expiring_soon")}
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.expiringSoon}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* Expired Contracts Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">
                {t("expired_contracts")}
              </p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {stats.expired}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center">
              <XCircle size={20} className="text-red-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className={`rounded-xl p-4 ${stats.expired > 0 ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={stats.expired > 0 ? "text-red-600" : "text-orange-600"} size={20} />
            <div>
              <h3 className={`font-medium ${stats.expired > 0 ? 'text-red-800' : 'text-orange-800'}`}>
                {stats.expired > 0 
                  ? t("attention_expired_contracts")
                  : t("attention_expiring_contracts")}
              </h3>
              <p className={`text-sm mt-1 ${stats.expired > 0 ? 'text-red-600' : 'text-orange-600'}`}>
                {stats.expired > 0
                  ? t("expired_contracts_warning", { count: stats.expired })
                  : t("expiring_contracts_warning", { count: stats.expiringSoon, days: days })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Days Selector */}
          <div className="relative min-w-[130px]">
            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="pl-10 pr-8 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer font-medium"
            >
              {daysOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_employee")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Department Filter */}
          <div className="relative min-w-[160px]">
            <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[130px]">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={16} />
              {t("clear_filters")}
            </button>
          )}
        </div>

        {/* Filter Stats */}
        {hasFilters && filteredData.length !== contracts.length && (
          <div className="text-sm text-gray-500">
            {t("showing")} {filteredData.length} {t("of")} {contracts.length} {t("contracts")}
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        columns={columns}
        keyExtractor={(item, index) => `${item.employeeCode}-${index}`}
        isLoading={loading}
        selectable
        emptyMessage={t("no_contracts_found")}
      />
    </div>
  );
};