
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Common';

export const GOSIContributionReport: React.FC = () => {
  const { t } = useTranslation();
  const { employees, payrollRecords } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const gosiData = useMemo(() => {
    return employees.map(emp => {
      const payroll = payrollRecords.find(p => p.employeeId === emp.id);
      const basicSalary = Number(payroll?.basicSalary || 0);
      const gosiSalary = basicSalary; // Simplified
      const empContrib = gosiSalary * 0.09;
      const employerContrib = gosiSalary * 0.09;
      const totalContrib = empContrib + employerContrib;

      return {
        id: emp.id,
        employeeId: emp.code,
        employeeName: emp.fullName,
        nationalId: emp.nationalId || 'N/A',
        basicSalary,
        gosiSalary,
        empContribPercent: '9%',
        employerContribPercent: '9%',
        totalContrib,
        status: 'Paid',
        avatar: emp.avatar
      };
    }).filter(e => e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [employees, payrollRecords, searchTerm]);

  const columns: Column<any>[] = [
    { header: t('employee_id'), accessorKey: 'employeeId' },
    { 
      header: t('employee_name'), 
      render: (e) => (
        <div className="flex items-center gap-2">
          <img src={e.avatar} alt={e.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{e.employeeName}</span>
        </div>
      )
    },
    { header: t('national_id'), accessorKey: 'nationalId' },
    { header: t('basic_salary'), render: (e) => e.basicSalary.toFixed(2) },
    { header: t('gosi_salary'), render: (e) => e.gosiSalary.toFixed(2) },
    { header: t('employee_contribution_percent'), accessorKey: 'empContribPercent' },
    { header: t('employer_contribution_percent'), accessorKey: 'employerContribPercent' },
    { header: t('total_contribution'), render: (e) => e.totalContrib.toFixed(2) },
    { 
      header: t('payment_status'), 
      render: (e) => (
        <Badge variant={e.status === 'Paid' ? 'success' : 'warning'}>
          {t(e.status.toLowerCase())}
        </Badge>
      )
    },
  ];

  return (
    <ReportLayout
      title={t('gosi_contribution_report')}
      subtitle={t('view_gosi_contributions_for_all_employees')}
      data={gosiData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="gosi_contribution_report"
    />
  );
};
