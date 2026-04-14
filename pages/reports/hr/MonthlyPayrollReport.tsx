
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { PayrollRecord } from '../../../types';

export const MonthlyPayrollReport: React.FC = () => {
  const { t } = useTranslation();
  const { payrollRecords, employees } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const filteredData = useMemo(() => {
    return payrollRecords.filter(p => {
      const matchesSearch = p.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = p.month === selectedMonth;
      return matchesSearch && matchesMonth;
    });
  }, [payrollRecords, searchTerm, selectedMonth]);

  const columns: Column<PayrollRecord>[] = [
    { header: t('date'), render: () => new Date().toLocaleDateString() },
    { header: t('employee_id'), accessorKey: 'employeeId' },
    { 
      header: t('employee_name'), 
      render: (p) => (
        <div className="flex items-center gap-2">
          <img src={p.avatar} alt={p.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{p.employeeName}</span>
        </div>
      )
    },
    { header: t('base_salary'), accessorKey: 'basicSalary' },
    { 
      header: t('allowances'), 
      render: (p) => (Number(p.housingAllowance) + Number(p.transportAllowance) + Number(p.workNatureAllowance) + Number(p.medicalAllowance)).toFixed(2)
    },
    { header: t('bonuses'), accessorKey: 'bonus' },
    { header: t('deductions'), render: (p) => (0).toFixed(2) }, // Placeholder for deductions
    { header: t('net_salary'), accessorKey: 'totals' },
    { header: t('payroll_month'), render: (p) => `${p.month}/${p.year}` },
  ];

  return (
    <ReportLayout
      title={t('monthly_payroll_report')}
      subtitle={t('view_payroll_details_by_month')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="monthly_payroll_report"
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
          ))}
        </select>
      }
    />
  );
};
