
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Contract } from '../../../types';
import { Badge } from '../../../components/ui/Common';

export const ExpiredContractsReport: React.FC = () => {
  const { t } = useTranslation();
  const { contracts, employees } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return contracts.filter(c => {
      const matchesSearch = c.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [contracts, searchTerm]);

  const columns: Column<Contract>[] = [
    { header: t('employee_id'), accessorKey: 'empCode' },
    { 
      header: t('employee_name'), 
      render: (c) => (
        <div className="flex items-center gap-2">
          <img src={c.avatar} alt={c.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{c.employeeName}</span>
        </div>
      )
    },
    { 
      header: t('department'), 
      render: (c) => employees.find(e => e.id === c.employeeId)?.departmentName || 'N/A' 
    },
    { header: t('job_title'), accessorKey: 'jobTitle' },
    { header: t('contract_start_date'), accessorKey: 'startDate' },
    { 
      header: t('state'), 
      render: (c) => (
        <Badge variant={c.state === 'Active' ? 'success' : 'danger'}>
          {t(c.state.toLowerCase())}
        </Badge>
      )
    },
    { 
      header: t('days_remaining'), 
      render: (c) => {
        const end = new Date(c.endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
      }
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
    />
  );
};
