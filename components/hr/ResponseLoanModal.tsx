import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Loan } from '../../types';

interface ResponseLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  onSave: (updated: Loan) => void;
}

const adjustSchema = z.object({
  deductionType: z.enum(['SINGLE', 'INSTALLMENTS']),
  installmentAmount: z.string().optional().or(z.literal('')),
  startMonth: z.string().min(1, 'Required'),
});

type AdjustFormInputs = z.infer<typeof adjustSchema>;

export const ResponseLoanModal: React.FC<ResponseLoanModalProps> = ({ isOpen, onClose, loan, onSave }) => {
  const { t } = useTranslation();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustFormInputs>({
    resolver: zodResolver(adjustSchema),
  });

  const deductionType = watch('deductionType');

  useEffect(() => {
    if (isOpen) {
      reset({
        deductionType: loan.deductionType === 'INSTALLMENTS' ? 'INSTALLMENTS' : 'SINGLE',
        installmentAmount: loan.installmentAmount ? String(loan.installmentAmount) : '',
        startMonth: loan.startMonth || new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, loan, reset]);

  const onSubmit = (data: AdjustFormInputs) => {
    onSave({
      ...loan,
      deductionType: data.deductionType,
      // Fix: Use correct interface key 'installmentAmount' instead of 'installment_amount'
      installmentAmount: data.deductionType === 'INSTALLMENTS' ? (data.installmentAmount || '0') : null,
      startMonth: data.startMonth,
    });
    onClose();
  };

  const footer = (
    <div className="flex gap-3">
      <Button variant="ghost" disabled={isSubmitting} className="bg-slate-700 text-white hover:bg-slate-800" onClick={onClose}>{t('cancel')}</Button>
      <Button type="submit" form="adjust-loan-form" disabled={isSubmitting} className="bg-[#4361EE] hover:bg-blue-700 min-w-[100px]">
        {isSubmitting ? '...' : t('save')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('details_of_loans')}
      footer={footer}
      className="max-w-2xl"
    >
      <form id="adjust-loan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4">
        <div className="grid grid-cols-2 gap-8">
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
            label={t('installment_amount') + ' *'} 
            placeholder="0.00"
            disabled={deductionType === 'SINGLE'}
            {...register('installmentAmount')}
            error={errors.installmentAmount?.message}
          />
          <Input 
            label={t('start_month') + ' *'} 
            type="date"
            {...register('startMonth')}
            error={errors.startMonth?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-8 border-t pt-8">
           <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('total_amount')}</p>
              <p className="text-blue-600 font-bold text-lg">{loan.loanAmount} SAR</p>
           </div>
           <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{t('remaining_amount')}</p>
              <p className="text-gray-900 dark:text-white font-bold text-lg">{loan.remainingAmount} SAR</p>
           </div>
        </div>
      </form>
    </Modal>
  );
};