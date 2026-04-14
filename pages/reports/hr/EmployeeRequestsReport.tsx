
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { RequestRecord } from '../../../types';
import { Badge } from '../../../components/ui/Common';

export const EmployeeRequestsReport: React.FC = () => {
  const { t } = useTranslation();
  const { requests, employees } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = r.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [requests, searchTerm]);

  const columns: Column<RequestRecord>[] = [
    { header: t('request_id'), accessorKey: 'requestId' },
    { 
      header: t('employee_name'), 
      render: (r) => (
        <div className="flex items-center gap-2">
          <img src={r.avatar} alt={r.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{r.employeeName}</span>
        </div>
      )
    },
    { 
      header: t('employee_id'), 
      render: (r) => employees.find(e => e.id === r.employeeId)?.code || 'N/A' 
    },
    { 
      header: t('department'), 
      render: (r) => employees.find(e => e.id === r.employeeId)?.departmentName || 'N/A' 
    },
    { header: t('request_type'), accessorKey: 'requestType' },
    { header: t('request_date'), accessorKey: 'date' },
    { header: t('approver_name'), render: () => 'Admin' },
    { 
      header: t('status'), 
      render: (r) => (
        <Badge variant={r.status === 'Approved' ? 'success' : r.status === 'Pending' ? 'warning' : 'danger'}>
          {t(r.status.toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('employee_requests_report')}
      subtitle={t('view_all_employee_requests_and_status')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="employee_requests_report"
    />
  );
};
