
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Contract } from '../../types';
import { useData } from '../../context/DataContext';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Contract) => Promise<void>;
  contractToEdit?: Contract | null;
}

const contractSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  contractType: z.string().min(1, 'Required'),
  duration: z.string().min(1, 'Required'),
  jobTitle: z.string().min(1, 'Required'),
  branch: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  workingHours: z.string().min(1, 'Required'),
  allowances: z.string().optional(),
  basicSalary: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  contractId: z.string().min(1, 'Required'), // mapped to contract_number
});

type ContractFormInputs = z.infer<typeof contractSchema>;

export const ContractModal: React.FC<ContractModalProps> = ({ isOpen, onClose, onSave, contractToEdit }) => {
  const { t } = useTranslation();
  const { employees, branches } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormInputs>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      state: 'Active'
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (contractToEdit) {
            reset({
                employeeId: contractToEdit.employeeId,
                contractType: contractToEdit.contractType,
                duration: contractToEdit.duration,
                jobTitle: contractToEdit.jobTitle,
                branch: contractToEdit.branch,
                startDate: contractToEdit.startDate?.split('T')[0] || '',
                endDate: contractToEdit.endDate?.split('T')[0] || '',
                workingHours: contractToEdit.workingHours,
                allowances: contractToEdit.allowances,
                basicSalary: contractToEdit.basicSalary,
                state: contractToEdit.state,
                contractId: contractToEdit.contractId,
            });
        } else {
            reset({
                employeeId: '',
                contractType: 'Saudi',
                duration: '1 Year',
                jobTitle: '',
                branch: branches.length > 0 ? branches[0].id : '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                workingHours: 'Full Time',
                allowances: '0',
                basicSalary: '0',
                state: 'Active',
                contractId: `CON-${Date.now().toString().slice(-5)}`,
            });
        }
    }
  }, [contractToEdit, isOpen, reset, branches]);

  const onSubmit = async (data: ContractFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    
    // Default allowances to '0' to satisfy Contract interface requirements
    const newContract: Contract = {
      id: contractToEdit ? contractToEdit.id : '',
      avatar: selectedEmp?.avatar,
      employeeName: selectedEmp?.fullName || '',
      ...data,
      allowances: data.allowances || '0',
      // Casting state to any because the interface expects a specific union type and the form value is a string
      state: data.state as any,
    };
    await onSave(newContract);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{contractToEdit ? '✎' : '⊕'}</span> {contractToEdit ? t('edit_contracts') : t('add_contracts')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" disabled={isSubmitting} className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="contract-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700">
           {isSubmitting ? 'Saving...' : (contractToEdit ? t('save') : t('add_contracts'))}
       </Button>
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
      <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Select 
                  label={t('employee_info') + ' *'} 
                  options={employees.map(e => ({ value: e.id, label: e.fullName }))}
                  {...register('employeeId')}
                  error={errors.employeeId?.message}
                />

                <Input label={t('contract_id') + ' *'} placeholder="CON-0001" {...register('contractId')} error={errors.contractId?.message} />
                
                <Input label={t('job_title') + ' *'} placeholder="Job Title" {...register('jobTitle')} error={errors.jobTitle?.message} />
                
                <Input type="date" label={t('start_date') + ' *'} {...register('startDate')} error={errors.startDate?.message} />
                <Select 
                   label={t('working_hours') + ' *'} 
                   options={[
                      {value: 'Full Time', label: 'Full Time'},
                      {value: 'Part Time', label: 'Part Time'}
                   ]}
                   {...register('workingHours')} 
                   error={errors.workingHours?.message} 
                />
                
                <Select 
                   label={t('branch') + ' *'} 
                   options={branches.map(b => ({ value: b.id, label: b.name }))}
                   {...register('branch')} 
                   error={errors.branch?.message} 
                />
            </div>
            
            <div className="space-y-6">
                <Select 
                   label={t('contract_type') + ' *'} 
                   options={[
                      {value: 'Saudi', label: 'Saudi'},
                      {value: 'Expat', label: 'Expat'}
                   ]}
                   {...register('contractType')} 
                   error={errors.contractType?.message} 
                />
                <Input label={t('duration') + ' *'} placeholder="e.g., 2 Years" {...register('duration')} error={errors.duration?.message} />
                <Input type="date" label={t('end_date') + ' *'} {...register('endDate')} error={errors.endDate?.message} />
                <Input label={t('basic_salary') + ' *'} type="number" placeholder="Amount" {...register('basicSalary')} error={errors.basicSalary?.message} />
                <Input label={t('allowances') + ' *'} type="number" placeholder="Allowances" {...register('allowances')} error={errors.allowances?.message} />
                
                <Select 
                  label={t('state') + ' *'} 
                  options={[
                    {value: 'Active', label: 'Active'},
                    {value: 'Expired', label: 'Expired'},
                    {value: 'Under Renewal', label: 'Under Renewal'},
                    {value: 'Renewal Pending', label: 'Renewal Pending'}
                  ]}
                  {...register('state')} 
                  error={errors.state?.message}
                />
            </div>
         </div>
      </form>
    </Modal>
  );
};
