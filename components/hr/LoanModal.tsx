
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Select } from '../ui/Common';
import { Modal } from '../ui/Modal';
import { Loan } from '../../types';
import { useData } from '../../context/DataContext';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Loan) => void;
  loanToEdit?: Loan | null;
}

const loanSchema = z.object({
  employeeId: z.string().min(1, 'Required'),
  loanAmount: z.string().min(1, 'Required'),
  reason: z.string().min(1, 'Required'),
  deductionType: z.enum(['SINGLE', 'INSTALLMENTS']),
  installmentAmount: z.string().optional(),
  startMonth: z.string().min(1, 'Required'),
});

type LoanFormInputs = z.infer<typeof loanSchema>;

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, loanToEdit }) => {
  const { t } = useTranslation();
  const { employees, currentUserEmployee } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<LoanFormInputs>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      deductionType: 'SINGLE',
      startMonth: new Date().toISOString().split('T')[0]
    }
  });

  const deductionType = watch('deductionType');

  useEffect(() => {
    if (loanToEdit) {
      reset({
        employeeId: loanToEdit.employeeId,
        loanAmount: loanToEdit.loanAmount,
        reason: loanToEdit.reason,
        deductionType: loanToEdit.deductionType === 'INSTALLMENTS' ? 'INSTALLMENTS' : 'SINGLE',
        installmentAmount: loanToEdit.installmentAmount || '',
        startMonth: loanToEdit.startMonth || new Date().toISOString().split('T')[0],
      });
    } else {
      reset({
        employeeId: currentUserEmployee?.id || '',
        loanAmount: '',
        reason: '',
        deductionType: 'SINGLE',
        installmentAmount: '',
        startMonth: new Date().toISOString().split('T')[0],
      });
    }
  }, [loanToEdit, isOpen, reset, currentUserEmployee]);

  const onSubmit = (data: LoanFormInputs) => {
    const selectedEmp = employees.find(e => e.id === data.employeeId);
    const newLoan: Loan = {
      id: loanToEdit ? loanToEdit.id : '',
      loanId: loanToEdit ? loanToEdit.loanId : '',
      createdAt: loanToEdit ? loanToEdit.createdAt : '',
      employeeName: selectedEmp ? selectedEmp.fullName : (loanToEdit?.employeeName || 'Unknown'),
      avatar: selectedEmp ? selectedEmp.avatar : (loanToEdit?.avatar || ''),
      remainingAmount: loanToEdit ? loanToEdit.remainingAmount : data.loanAmount,
      status: loanToEdit ? loanToEdit.status : 'Pending',
      approved_by_hr: loanToEdit ? loanToEdit.approved_by_hr : false,
      approved_by_manager: loanToEdit ? loanToEdit.approved_by_manager : false,
      workflowStatus: loanToEdit ? loanToEdit.workflowStatus : { hr: false, manager: false },
      ...data,
      installmentAmount: data.installmentAmount || null,
    };
    onSave(newLoan);
    onClose();
  };

  const title = (
    <div className="flex items-center gap-2">
      {loanToEdit ? <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">✎</span> : <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">⊕</span>}
      <span>{loanToEdit ? t('edit_loans') : t('add_loans')}</span>
    </div>
  );

  const footer = (
    <div className="flex justify-end gap-3 w-full">
       <Button type="button" variant="ghost" className="bg-slate-700 text-white hover:bg-slate-800" onClick={onClose}>{t('cancel')}</Button>
       <Button type="submit" form="loan-form" className="bg-[#4361EE] hover:bg-blue-700 min-w-[120px]">
          {loanToEdit ? t('save') : (
             <div className="flex items-center gap-2">
                <span>⊕</span>
                <span>{t('add_loans')}</span>
             </div>
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
      className="max-w-2xl"
    >
      <form id="loan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('employee_info')} <span className="text-red-500">*</span>
               </label>
               <input 
                  type="text" 
                  readOnly 
                  disabled
                  value={employees.find(e => e.id === currentUserEmployee?.id)?.fullName || 'Loading...'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
               />
               <input type="hidden" {...register('employeeId')} />
            </div>
            
            <Input 
               label={t('loan_amount') + ' *'} 
               placeholder="2000.00"
               {...register('loanAmount')} 
               error={errors.loanAmount?.message} 
            />

            <Select 
              label={t('deduction_type') + ' *'} 
              options={[
                { value: 'SINGLE', label: 'Single Payment' },
                { value: 'INSTALLMENTS', label: 'Installments' }
              ]}
              {...register('deductionType')}
              error={errors.deductionType?.message}
            />

            <Input 
               label={t('start_month') + ' *'} 
               type="date"
               {...register('startMonth')} 
               error={errors.startMonth?.message} 
            />

            {deductionType === 'INSTALLMENTS' && (
              <Input 
                label={t('installment_amount') + ' *'} 
                placeholder="400.00"
                {...register('installmentAmount')} 
                error={errors.installmentAmount?.message} 
              />
            )}
         </div>
         
         <Input 
            label={t('reason') + ' *'} 
            placeholder="Reason for loan request..."
            {...register('reason')} 
            error={errors.reason?.message} 
         />
      </form>
    </Modal>
  );
};
