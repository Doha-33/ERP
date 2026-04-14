
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { DeductionRecord } from '../../types';
import { useData } from '../../context/DataContext';
import { PlusCircle, Edit2 } from 'lucide-react';

interface DeductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: DeductionRecord) => void;
  recordToEdit?: DeductionRecord | null;
}

const deductionSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  company: z.string().min(1, 'Required'),
  branch: z.string().min(1, 'Required'),
});

type DeductionFormInputs = z.infer<typeof deductionSchema>;

export const DeductionModal: React.FC<DeductionModalProps> = ({ isOpen, onClose, onSave, recordToEdit }) => {
  const { t } = useTranslation();
  const { employees, companies, branches } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DeductionFormInputs>({
    resolver: zodResolver(deductionSchema),
  });

  const selectedEmployeeId = watch('employeeId');

  // Auto-fill company and branch when employee is selected
  useEffect(() => {
    if (selectedEmployeeId && !recordToEdit) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) {
        if (emp.company) setValue('company', emp.company);
        if (emp.branch) setValue('branch', emp.branch);
      }
    }
  }, [selectedEmployeeId, employees, setValue, recordToEdit]);

  useEffect(() => {
    if (isOpen) {
      if (recordToEdit) {
        reset({
          employeeId: recordToEdit.employeeId,
          company: recordToEdit.company,
          branch: recordToEdit.branch,
        });
      } else {
        reset({
          employeeId: '',
          company: '',
          branch: '',
        });
      }
    }
  }, [recordToEdit, isOpen, reset]);

  const onSubmit = (data: DeductionFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    const selectedComp = companies.find(c => c.id === data.company);
    const selectedBr = branches.find(b => b.id === data.branch);

    // Amounts are handled automatically by the backend/context logic
    const newRecord: DeductionRecord = {
      id: recordToEdit ? recordToEdit.id : '',
      employeeId: data.employeeId,
      employeeName: selectedEmp?.fullName || '',
      avatar: selectedEmp?.avatar,
      company: selectedComp?.name || data.company,
      branch: selectedBr?.name || data.branch,
      absence: recordToEdit?.absence || '0',
      lateArrival: recordToEdit?.lateArrival || '0',
      earlyLeave: recordToEdit?.earlyLeave || '0',
      loan: recordToEdit?.loan || '0',
      penalties: recordToEdit?.penalties || '0',
      // Comment above fix: Ensure month and year are stored as numbers to fix type assignability errors
      month: recordToEdit?.month || (new Date().getMonth() + 1),
      year: recordToEdit?.year || new Date().getFullYear(),
    };
    onSave(newRecord);
    onClose();
  };

  const title = (
    <div className="flex items-center gap-3">
      {recordToEdit ? (
        <Edit2 size={24} className="text-[#2D3748]" />
      ) : (
        <PlusCircle size={24} className="text-[#2D3748]" />
      )}
      <span className="text-[#2D3748] font-bold text-2xl">
        {recordToEdit ? t('edit_deductions') : t('add_deductions')}
      </span>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-4 w-full">
       <Button 
          type="button" 
          className="bg-[#4A5568] hover:bg-[#2D3748] text-white px-10 rounded-xl py-3 font-bold" 
          onClick={onClose}
        >
          {t('cancel')}
        </Button>
       <Button 
          type="submit" 
          form="deduction-form" 
          className="bg-[#4361EE] hover:bg-blue-700 min-w-[180px] flex items-center justify-center gap-2 text-white rounded-xl py-3 font-bold shadow-lg shadow-blue-200"
        >
          {recordToEdit ? (
            t('save')
          ) : (
            <>
              <PlusCircle size={18} />
              {t('add_deductions')}
            </>
          )}
       </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      className="max-w-3xl"
    >
      <form id="deduction-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="md:col-span-1">
               <Select 
                  label={<span className="text-[#718096] font-bold flex items-center gap-1">{t('employee_info')} <span className="text-red-500 font-bold">*</span></span>}
                  options={[{value: '', label: 'Select Employee'}, ...employees.map(e => ({ value: e.id, label: e.fullName }))]}
                  {...register('employeeId')} 
                  error={errors.employeeId?.message as string} 
                  className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium text-primary"
               />
            </div>
            <div className="hidden md:block"></div>

            <Select 
               label={<span className="text-[#718096] font-bold flex items-center gap-1">{t('company')} <span className="text-red-500 font-bold">*</span></span>}
               options={[{value: '', label: 'Select Company'}, ...companies.map(c => ({ value: c.id, label: c.name }))]}
               {...register('company')} 
               error={errors.company?.message as string} 
               className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium text-primary"
            />
            
            <Select 
               label={<span className="text-[#718096] font-bold flex items-center gap-1">{t('branch')} <span className="text-red-500 font-bold">*</span></span>}
               options={[{value: '', label: 'Select Branch'}, ...branches.map(b => ({ value: b.id, label: b.name }))]}
               {...register('branch')} 
               error={errors.branch?.message as string} 
               className="rounded-xl border-[#E2E8F0] py-3 text-sm font-medium text-primary"
            />
         </div>
      </form>
    </Modal>
  );
};
