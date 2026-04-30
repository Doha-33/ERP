
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';
import hrService from '../../../services/hr.service';

export const ExpiredContractsReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [days, setDays] = useState(60);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const reportData = await hrService.getContractsExpiryReport(days);
      setData(reportData || []);
    } catch (error) {
      console.error('Failed to fetch contracts expiry report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((c: any) => {
      const matchesSearch = (c.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeCode' },
    { 
      header: t('employee_name'), 
      render: (c) => (
        <div className="flex items-center gap-2">
          {c.avatar && <img src={c.avatar} alt={c.employeeName} className="w-8 h-8 rounded-full object-cover" />}
          <span className="font-bold">{c.employeeName}</span>
        </div>
      )
    },
    { header: t('department'), accessorKey: 'departmentName' },
    { header: t('job_title'), accessorKey: 'jobTitle' },
    { header: t('contract_start_date'), accessorKey: 'startDate' },
    { header: t('contract_end_date'), accessorKey: 'endDate' },
    { 
      header: t('state'), 
      render: (c) => (
        <Badge variant={c.state === 'Active' ? 'success' : 'danger'}>
          {t((c.state || 'inactive').toLowerCase())}
        </Badge>
      )
    },
    { 
      header: t('days_remaining'), 
      accessorKey: 'daysRemaining'
    },
  ];

  return (
    <ReportLayout
      title={t('expired_contracts_report')}
      subtitle={t('view_contracts_nearing_expiration')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="expired_contracts_report"
      isLoading={loading}
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={30}>30 {t('days')}</option>
          <option value={60}>60 {t('days')}</option>
          <option value={90}>90 {t('days')}</option>
          <option value={180}>180 {t('days')}</option>
        </select>
      }
    />
  );
};
