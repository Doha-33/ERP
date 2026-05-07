import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  Search, Calendar, Users, Briefcase, 
  UserCheck, TrendingUp, Percent, RefreshCw,
  Download, X, Target, Clock
} from "lucide-react";
import { Table, Column } from "../../../components/ui/Table";
import hrService from "../../../services/hr.service";
import { toast } from "sonner";
import { ExportDropdown } from "@/components/ui/Common";

export const HiringReport: React.FC = () => {
  const { t } = useTranslation();
  const [reportData, setReportData] = useState({
    year: new Date().getFullYear(),
    totalCandidates: 0,
    totalOffers: 0,
    totalHires: 0,
    overallConversionRate: 0,
    sourceEffectiveness: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await hrService.getHiringReport();
      if (response?.data) {
        setReportData(response.data);
      } else if (response?.success && response?.data) {
        setReportData(response.data);
      } else if (response?.sourceEffectiveness) {
        setReportData(response);
      } else {
        setReportData({
          year: new Date().getFullYear(),
          totalCandidates: 0,
          totalOffers: 0,
          totalHires: 0,
          overallConversionRate: 0,
          sourceEffectiveness: response || []
        });
      }
    } catch (error) {
      console.error("Error fetching hiring report:", error);
      toast.error(t("failed_to_fetch_report"));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let sources = reportData.sourceEffectiveness || [];
    
    if (searchTerm) {
      sources = sources.filter(source => 
        source.sourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        source.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (dateFrom) {
      sources = sources.filter(source => source.period >= dateFrom);
    }
    
    if (dateTo) {
      sources = sources.filter(source => source.period <= dateTo);
    }
    
    return sources;
  }, [reportData.sourceEffectiveness, searchTerm, dateFrom, dateTo]);

  const filteredCandidates = filteredData.reduce(
    (sum, source) => sum + (source.candidates || 0), 0
  );
  const filteredOffers = filteredData.reduce(
    (sum, source) => sum + (source.offers || 0), 0
  );
  const filteredHires = filteredData.reduce(
    (sum, source) => sum + (source.hires || 0), 0
  );
  const filteredConversionRate = filteredCandidates > 0 
    ? (filteredHires / filteredCandidates) * 100 
    : 0;

  const columns: Column<any>[] = [
    {
      header: t("source"),
      render: (source) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {source.sourceName}
            </span>
            <span className="text-xs text-gray-500">
              {source.department || t("all_departments")}
            </span>
          </div>
        </div>
      )
    },
    {
      header: t("period"),
      render: (source) => (
        <div className="flex items-center gap-1.5">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {source.period || reportData.year}
          </span>
        </div>
      )
    },
    {
      header: t("candidates"),
      render: (source) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-600">
            {source.candidates || 0}
          </span>
        </div>
      )
    },
    {
      header: t("offers"),
      render: (source) => (
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-purple-500" />
          <span className="text-sm font-semibold text-purple-600">
            {source.offers || 0}
          </span>
        </div>
      )
    },
    {
      header: t("hires"),
      render: (source) => (
        <div className="flex items-center gap-1.5">
          <UserCheck size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">
            {source.hires || 0}
          </span>
        </div>
      )
    },
    {
      header: t("conversion_rate"),
      render: (source) => {
        const rate = source.candidates > 0 
          ? (source.hires / source.candidates) * 100 
          : 0;
        return (
          <div className="flex items-center gap-1.5">
            <Percent size={14} className="text-orange-500" />
            <span className={`text-sm font-bold ${
              rate > 30 
                ? 'text-green-600' 
                : rate > 15 
                  ? 'text-blue-600'
                  : 'text-yellow-600'
            }`}>
              {rate.toFixed(1)}%
            </span>
          </div>
        );
      }
    },
    {
      header: t("time_to_hire"),
      render: (source) => (
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {source.avgTimeToHire || "-"} {t("days")}
          </span>
        </div>
      )
    },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = searchTerm || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("hiring_and_recruitment_report")}
          </h1>
          <p className="text-gray-500 mt-1">
            {t("monitor_hiring_performance_and_metrics")}
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
          <ExportDropdown data={filteredData} filename="gosi-contribution-report" />
          
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("year")}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reportData.year}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar size={20} className="text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_candidates")}
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {reportData.totalCandidates}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_offers")}
              </p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {reportData.totalOffers}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Briefcase size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                {t("total_hires")}
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {reportData.totalHires}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck size={20} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-600 font-medium">
              {t("overall_conversion_rate")}
            </p>
            <p className="text-3xl font-bold text-indigo-700 mt-1">
              {reportData.overallConversionRate.toFixed(1)}%
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
            <Target size={24} className="text-indigo-700" />
          </div>
        </div>
        <div className="mt-3 w-full bg-indigo-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(reportData.overallConversionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative max-w-md flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_by_source_or_department")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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

        {hasFilters && filteredData.length !== reportData.sourceEffectiveness?.length && (
          <div className="text-sm text-gray-500">
            {t("showing")} {filteredData.length} {t("of")} {reportData.sourceEffectiveness?.length || 0} {t("sources")}
          </div>
        )}
      </div>

      {/* Table */}
      <Table
        data={filteredData}
        columns={columns}
        keyExtractor={(item, index) => `${item.sourceName}-${index}`}
        isLoading={isLoading}
        selectable
        emptyMessage={t("no_hiring_data_found")}
      />
    </div>
  );
};