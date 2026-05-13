import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Button, Input, Select, TextArea } from '../ui/Common';
import { AccountReceivable } from '../../types';

const arSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  paidAmount: z.number().min(0, 'Paid amount must be positive'),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID']),
  notes: z.string().optional(),
}).refine((data) => data.paidAmount <= data.amount, {
  message: 'Paid amount cannot exceed total amount',
  path: ['paidAmount'],
});

type ARFormData = z.infer<typeof arSchema>;

interface ARModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ARFormData) => void;
  arToEdit?: AccountReceivable | null;
}

export const AccountsReceivableModal: React.FC<ARModalProps> = ({
  isOpen,
  onClose,
  onSave,
  arToEdit,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ARFormData>({
    resolver: zodResolver(arSchema),
    defaultValues: {
      customerName: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      paidAmount: 0,
      status: 'PENDING',
      notes: '',
    },
  });

  const amount = watch('amount');
  const paidAmount = watch('paidAmount');
  const status = watch('status');

  // Auto-calculate status based on amounts
  useEffect(() => {
    if (amount > 0 && !arToEdit) {
      if (paidAmount === 0) {
        setValue('status', 'PENDING');
      } else if (paidAmount >= amount) {
        setValue('status', 'PAID');
      } else if (paidAmount > 0 && paidAmount < amount) {
        setValue('status', 'PARTIAL');
      }
    }
  }, [amount, paidAmount, setValue, arToEdit]);

  useEffect(() => {
    if (arToEdit) {
      reset({
        customerName: arToEdit.customerName,
        invoiceNumber: arToEdit.invoiceNumber,
        invoiceDate: arToEdit.invoiceDate ? new Date(arToEdit.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: arToEdit.dueDate ? new Date(arToEdit.dueDate).toISOString().split('T')[0] : '',
        amount: arToEdit.amount,
        paidAmount: arToEdit.paidAmount,
        status: arToEdit.status as any,
        notes: arToEdit.notes || '',
      });
    } else {
      reset({
        customerName: '',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 0,
        paidAmount: 0,
        status: 'PENDING',
        notes: '',
      });
    }
  }, [arToEdit, reset]);

  const onSubmit = (data: ARFormData) => {
    onSave(data);
    onClose();
  };

  const statusOptions = [
    { value: 'PENDING', label: t('pending') },
    { value: 'PARTIAL', label: t('partial') },
    { value: 'PAID', label: t('paid') },
  ];

  const remainingAmount = amount - paidAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={arToEdit ? t('edit_accounts_receivable') : t('add_accounts_receivable')}
      className="w-full max-w-md mx-4 sm:mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <Input
          label={t('customer_name')}
          {...register('customerName')}
          error={errors.customerName?.message}
          required
          fullWidth
        />
        
        <Input
          label={t('invoice_number')}
          {...register('invoiceNumber')}
          error={errors.invoiceNumber?.message}
          required
          fullWidth
        />
        
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <Input
            label={t('invoice_date')}
            type="date"
            {...register('invoiceDate')}
            error={errors.invoiceDate?.message}
            required
            fullWidth
          />
          <Input
            label={t('due_date')}
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
            required
            fullWidth
          />
        </div>
        
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <Input
            label={t('amount')}
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
            required
            fullWidth
          />
          <Input
            label={t('paid_amount')}
            type="number"
            step="0.01"
            {...register('paidAmount', { valueAsNumber: true })}
            error={errors.paidAmount?.message}
            fullWidth
          />
        </div>

        {/* Show remaining amount */}
        {amount > 0 && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('remaining_balance')}:</span>
              <span className={`font-semibold ${remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        <Select
          label={t('status')}
          options={statusOptions}
          {...register('status')}
          error={errors.status?.message}
          required
          fullWidth
        />
        
        <TextArea
          label={t('notes')}
          {...register('notes')}
          error={errors.notes?.message}
          fullWidth
          rows={3}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
          <Button variant="outline" type="button" onClick={onClose} className="w-full sm:w-auto">
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto justify-center">
            {t('save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};