
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Insurance } from '../../types';
import { useData } from '../../context/DataContext';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (insurance: Insurance) => void;
  insuranceToEdit?: Insurance | null;
}

const insuranceSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  policyNumber: z.string().min(1, 'Required'),
  insuranceCompany: z.string().min(1, 'Required'),
  planName: z.string().min(1, 'Required'),
  totalCost: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  coverageExpiry: z.string().min(1, 'Required'),
  membershipId: z.string().min(1, 'Required'),
  policyPlan: z.string().min(1, 'Required'),
  familyMembers: z.string().min(1, 'Required'),
});

type InsuranceFormInputs = z.infer<typeof insuranceSchema>;

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ isOpen, onClose, onSave, insuranceToEdit }) => {
  const { t } = useTranslation();
  const { employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsuranceFormInputs>({
    resolver: zodResolver(insuranceSchema),
  });

  useEffect(() => {
    if (insuranceToEdit) {
      reset({
        employeeId: insuranceToEdit.employeeId,
        policyNumber: insuranceToEdit.policyNumber,
        insuranceCompany: insuranceToEdit.insuranceCompany,
        planName: insuranceToEdit.planName,
        totalCost: insuranceToEdit.totalCost,
        startDate: insuranceToEdit.startDate,
        endDate: insuranceToEdit.endDate,
        coverageExpiry: insuranceToEdit.coverageExpiry,
        membershipId: insuranceToEdit.membershipId,
        policyPlan: insuranceToEdit.policyPlan,
        familyMembers: insuranceToEdit.familyMembers,
      });
    } else {
      reset({
        employeeId: '',
        policyNumber: '',
        insuranceCompany: '',
        planName: '',
        totalCost: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        coverageExpiry: new Date().toISOString().split('T')[0],
        membershipId: '',
        policyPlan: '',
        familyMembers: '',
      });
    }
  }, [insuranceToEdit, isOpen, reset]);

  const onSubmit = (data: InsuranceFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    
    const newInsurance: Insurance = {
      id: insuranceToEdit ? insuranceToEdit.id : '', // Handled by DataContext/API
      employeeId: data.employeeId,
      employeeName: selectedEmp ? selectedEmp.fullName : '', 
      avatar: selectedEmp ? selectedEmp.avatar : '',
      ...data,
    };
    onSave(newInsurance);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{insuranceToEdit ? '✎' : '⊕'}</span> {insuranceToEdit ? t('edit_insurance') : t('add_insurance')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="insurance-form" className="bg-[#4361EE] hover:bg-blue-700">{insuranceToEdit ? t('save') : t('add_insurance')}</Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-4xl"
    >
      <form id="insurance-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                  label={t('employee_info') + ' *'} 
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')}
                  error={errors.employeeId?.message}
                />
                
                <Input 
                   label={t('policy_number') + ' *'} 
                   placeholder="INS-0001"
                   {...register('policyNumber')} 
                   error={errors.policyNumber?.message} 
                />

                <Select 
                   label={t('plan_name') + ' *'} 
                   options={[
                     {value: 'Bronze', label: 'Bronze'},
                     {value: 'Silver', label: 'Silver'},
                     {value: 'Gold', label: 'Gold'}
                   ]}
                   {...register('planName')}
                   error={errors.planName?.message}
                />

                <Input 
                   type="date"
                   label={t('policy_start_date') + ' *'} 
                   {...register('startDate')} 
                   error={errors.startDate?.message} 
                />

                <Input 
                   type="date"
                   label={t('coverage_expiry') + ' *'} 
                   {...register('coverageExpiry')} 
                   error={errors.coverageExpiry?.message} 
                />

                <Select 
                   label={t('policy_plan') + ' *'} 
                   options={[
                     {value: 'Standard', label: 'Standard'},
                     {value: 'Premium', label: 'Premium'}
                   ]}
                   {...register('policyPlan')}
                   error={errors.policyPlan?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Select 
                   label={t('insurance_company') + ' *'} 
                   options={[
                     {value: 'Company X', label: 'Company X'},
                     {value: 'Company Y', label: 'Company Y'}
                   ]}
                   {...register('insuranceCompany')}
                   error={errors.insuranceCompany?.message}
                />
                
                <Input 
                   label={t('total_cost') + ' *'} 
                   placeholder="1500" 
                   {...register('totalCost')} 
                   error={errors.totalCost?.message} 
                />

                <Input 
                   type="date"
                   label={t('policy_end_date') + ' *'} 
                   {...register('endDate')} 
                   error={errors.endDate?.message} 
                />

                <Input 
                   label={t('membership_id') + ' *'} 
                   placeholder="00123456 / MG-01234"
                   {...register('membershipId')} 
                   error={errors.membershipId?.message} 
                />

                <Input 
                   label={t('family_members') + ' *'} 
                   placeholder="3"
                   type="number"
                   {...register('familyMembers')} 
                   error={errors.familyMembers?.message} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
