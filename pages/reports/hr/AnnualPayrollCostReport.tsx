
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';

export const AnnualPayrollCostReport: React.FC = () => {
  const { t } = useTranslation();
  const { payrollRecords, departments, employees } = useData();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const deptData = useMemo(() => {
    return departments.map(dept => {
      const deptPayroll = payrollRecords.filter(p => {
        const emp = employees.find(e => e.id === p.employeeId);
        return emp?.department === dept.id && p.year === selectedYear;
      });

      const totalBase = deptPayroll.reduce((sum, p) => sum + Number(p.basicSalary), 0);
      const totalAllowances = deptPayroll.reduce((sum, p) => sum + Number(p.housingAllowance) + Number(p.transportAllowance) + Number(p.workNatureAllowance) + Number(p.medicalAllowance), 0);
      const totalBonuses = deptPayroll.reduce((sum, p) => sum + Number(p.bonus), 0);
      const totalNet = deptPayroll.reduce((sum, p) => sum + Number(p.totals), 0);

      return {
        id: dept.id,
        departmentName: dept.name,
        totalBase,
        totalAllowances,
        totalBonuses,
        totalDeductions: 0, // Placeholder
        netPayrollCost: totalNet,
        date: new Date().toLocaleDateString()
      };
    });
  }, [departments, payrollRecords, employees, selectedYear]);

  const columns: Column<any>[] = [
    { header: t('date'), accessorKey: 'date' },
    { header: t('department_name'), accessorKey: 'departmentName' },
    { header: t('total_base_salary'), render: (d) => d.totalBase.toFixed(2) },
    { header: t('total_allowances'), render: (d) => d.totalAllowances.toFixed(2) },
    { header: t('total_bonuses'), render: (d) => d.totalBonuses.toFixed(2) },
    { header: t('total_deductions'), render: (d) => d.totalDeductions.toFixed(2) },
    { header: t('net_payroll_cost'), render: (d) => d.netPayrollCost.toFixed(2) },
  ];

  return (
    <ReportLayout
      title={t('annual_payroll_cost_by_department')}
      subtitle={t('view_payroll_costs_grouped_by_department')}
      data={deptData}
      columns={columns}
      filename="annual_payroll_cost_report"
      filters={
        <select 
          className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      }
    />
  );
};
