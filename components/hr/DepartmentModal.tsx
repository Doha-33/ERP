
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Department } from '../../types';
import { useData } from '../../context/DataContext';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Department) => void;
  departmentToEdit?: Department | null;
}

const departmentSchema = z.object({
  companyId: z.string().min(1, 'Required'),
  departmentName: z.string().min(1, 'Required'),
  managerName: z.string().min(1, 'Required'),
});

type DepartmentFormInputs = z.infer<typeof departmentSchema>;

export const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose, onSave, departmentToEdit }) => {
  const { t } = useTranslation();
  const { companies, employees } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormInputs>({
    resolver: zodResolver(departmentSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        reset({
          companyId: typeof departmentToEdit.companyId === 'object' ? departmentToEdit.companyId._id : departmentToEdit.companyId,
          departmentName: departmentToEdit.departmentName,
          managerName: departmentToEdit.managerName,
        });
      } else {
        reset({
          companyId: companies.length > 0 ? companies[0].id : '',
          departmentName: '',
          managerName: '',
        });
      }
    }
  }, [departmentToEdit, isOpen, reset, companies, employees]);

  const onSubmit = (data: DepartmentFormInputs) => {
    const newDepartment: any = {
      _id: departmentToEdit ? departmentToEdit._id : undefined,
      ...data,
      state: 'ACTIVE'
    };
    onSave(newDepartment);
    onClose();
  };

  const title = (
    <>
      <span className="text-lg">{departmentToEdit ? '✎' : '⊕'}</span> {departmentToEdit ? t('edit_department') : t('add_department')}
    </>
  );

  const footer = (
    <>
       <Button type="button" variant="ghost" className="bg-gray-700 text-white hover:bg-gray-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="department-form" className="bg-[#4361EE] hover:bg-blue-700">{departmentToEdit ? t('save') : t('add_department')}</Button>
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
      <form id="department-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-6">
                <Select 
                   label={t('company_name') + ' *'} 
                   options={companies.map(c => ({ value: c.id, label: c.name }))}
                   {...register('companyId')} 
                   error={errors.companyId?.message} 
                />
                
                <Input 
                   label={t('manager_name') + ' *'} 
                   placeholder="Manager Name"
                   {...register('managerName')}
                   error={errors.managerName?.message}
                />
             </div>
             
             <div className="space-y-6">
                <Input 
                   label={t('department_name') + ' *'} 
                   placeholder="Department Name" 
                   {...register('departmentName')} 
                   error={errors.departmentName?.message} 
                />
             </div>
         </div>
      </form>
    </Modal>
  );
};
