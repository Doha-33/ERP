
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../../context/DataContext';
import { ReportLayout } from '../../../components/reports/ReportLayout';
import { Column } from '../../../components/ui/Table';
import { Insurance } from '../../../types';

export const InsuranceReport: React.FC = () => {
  const { t } = useTranslation();
  const { insurancePolicies } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return insurancePolicies.filter(i => {
      const matchesSearch = i.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [insurancePolicies, searchTerm]);

  const columns: Column<Insurance>[] = [
    { 
      header: t('employee_name'), 
      render: (i) => (
        <div className="flex items-center gap-2">
          <img src={i.avatar} alt={i.employeeName} className="w-8 h-8 rounded-full object-cover" />
          <span className="font-bold">{i.employeeName}</span>
        </div>
      )
    },
    { header: t('policy_number'), accessorKey: 'policyNumber' },
    { header: t('insurance_company'), accessorKey: 'insuranceCompany' },
    { header: t('plan_name'), accessorKey: 'planName' },
    { header: t('policy_start_date'), accessorKey: 'startDate' },
    { header: t('policy_end_date'), accessorKey: 'endDate' },
    { header: t('total_cost'), accessorKey: 'totalCost' },
    { header: t('policy_plan'), accessorKey: 'policyPlan' },
    { header: t('family_members'), accessorKey: 'familyMembers' },
    { header: t('coverage_expiry_date'), accessorKey: 'coverageExpiry' },
    { header: t('membership_id'), accessorKey: 'membershipId' },
  ];

  return (
    <ReportLayout
      title={t('insurance_policies_report')}
      subtitle={t('view_insurance_coverage_details')}
      data={filteredData}
      columns={columns}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder={t('search_by_name')}
      filename="insurance_policies_report"
    />
  );
};
