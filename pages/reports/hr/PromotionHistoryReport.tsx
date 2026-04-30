
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const PromotionHistoryReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getPromotionHistoryReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching promotion history report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(e => (e.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [data, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeCode' },
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          {e.avatar && <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{e.employeeName}</span>
        </div>
      )
    },
    { header: t('previous_position'), accessorKey: 'oldPosition' },
    { header: t('new_position'), accessorKey: 'newPosition' },
    { header: t('previous_salary'), render: (e) => Number(e.oldSalary || 0).toFixed(2) },
    { header: t('new_salary'), render: (e) => Number(e.newSalary || 0).toFixed(2) },
    { header: t('promotion_date'), accessorKey: 'date' },
    { 
      header: t('salary_increase'), 
      render: (e) => `${Number(e.increasePercent || 0).toFixed(2)}%`
    },
  ];

  return (
    <ReportLayout
      title={t('promotion_history_report')}
      subtitle={t('track_employee_career_growth_and_promotions')}
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="promotion_history_report"
    />
  );
};
