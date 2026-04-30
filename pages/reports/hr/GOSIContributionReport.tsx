
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';
import hrService from '../../../services/hr.service';

export const GOSIContributionReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getGosiReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching GOSI report:', error);
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
    { header: t('national_id'), accessorKey: 'nationalId' },
    { header: t('basic_salary'), render: (e) => Number(e.basicSalary || 0).toFixed(2) },
    { header: t('gosi_salary'), render: (e) => Number(e.gosiSalary || 0).toFixed(2) },
    { header: t('employee_contribution'), render: (e) => Number(e.empContrib || 0).toFixed(2) },
    { header: t('employer_contribution'), render: (e) => Number(e.employerContrib || 0).toFixed(2) },
    { header: t('total_contribution'), render: (e) => Number(e.totalContrib || 0).toFixed(2) },
    { 
      header: t('payment_status'), 
      render: (e) => (
        <Badge variant={e.status === 'Paid' ? 'success' : 'warning'}>
          {t((e.status || 'pending').toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('gosi_contribution_report')}
      subtitle={t('view_gosi_contributions_for_all_employees')}
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="gosi_contribution_report"
    />
  );
};
