
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import hrService from '../../../services/hr.service';

export const LeaveBalanceReport: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const reportData = await hrService.getLeaveBalanceReport();
        setData(reportData || []);
      } catch (error) {
        console.error('Error fetching leave balance report:', error);
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
    { header: t('department'), accessorKey: 'departmentName' },
    { header: t('total_accrued'), accessorKey: 'totalAccrued' },
    { header: t('total_used'), accessorKey: 'totalUsed' },
    { 
      header: t('remaining_balance'), 
      render: (e) => (
        <span className={`font-bold ${Number(e.balance) < 5 ? 'text-orange-600' : 'text-green-600'}`}>
          {e.balance} {t('days')}
        </span>
      )
    },
    { header: t('last_updated'), accessorKey: 'lastUpdated' },
  ];

  return (
    <ReportLayout
      title={t('leave_balance_report')}
      subtitle={t('view_remaining_leave_balances_for_all_employees')}
      data={filteredData}
      columns={columns}
      isLoading={isLoading}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="leave_balance_report"
    />
  );
};
