
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const PerformanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getPerformanceReport(selectedPeriod);
      setData(reportData || []);
    } catch (error) {
      console.error('Failed to fetch performance report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((e: any) => {
      const matchesSearch = (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const columns: Column<any>[] = [
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          {e.avatar && <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{e.employeeName}</span>
        </div>
      )
    },
    { header: t('attendance'), accessorKey: 'attendance' },
    { header: t('productivity'), accessorKey: 'productivity' },
    { header: t('teamwork'), accessorKey: 'teamwork' },
    { header: t('communication'), accessorKey: 'communication' },
    { header: t('skill_development'), accessorKey: 'skillDevelopment' },
    { 
      header: t('overall_score'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.overallScore) >= 80 ? 'text-green-600' : Number(e.overallScore) >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
          {e.overallScore}%
        </span>
      )
    },
    { header: t('comments'), accessorKey: 'comments' },
  ];

  return (
    <ReportLayout
      title={t('performance_report')}
      subtitle={t('view_performance_evaluations_summary')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="performance_report"
      isLoading={loading}
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="Q1-2026">Q1-2026</option>
          <option value="Q2-2026">Q2-2026</option>
          <option value="Q3-2026">Q3-2026</option>
          <option value="Q4-2026">Q4-2026</option>
        </select>
      }
    />
  );
};
