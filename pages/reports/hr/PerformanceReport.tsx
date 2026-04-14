
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Evaluation } from '../../../types';

export const PerformanceReport: React.FC = () => {
  const { t } = useTranslation();
  const { evaluations } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return evaluations.filter(e => {
      const matchesSearch = e.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [evaluations, searchTerm]);

  const columns: Column<Evaluation>[] = [
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />
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
    />
  );
};
