import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input, Button, TextArea } from '../ui/Common';
import { AccountPayable } from '../../types';

const apSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  notes: z.string().optional(),
});

type APFormData = z.infer<typeof apSchema>;

interface AccountsPayableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: APFormData) => Promise<void>;
  initialData?: AccountPayable | null;
  isLoading?: boolean;
}

export const AccountsPayableModal: React.FC<AccountsPayableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<APFormData>({
    resolver: zodResolver(apSchema),
    defaultValues: {
      vendorName: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: 0,
      notes: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        vendorName: initialData.vendorName,
        invoiceNumber: initialData.invoiceNumber,
        invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        amount: initialData.amount,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        vendorName: '',
        invoiceNumber: `PO-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: 0,
        notes: '',
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = async (data: APFormData) => {
    await onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('edit_accounts_payable') : t('add_accounts_payable')}
      className="w-full max-w-md mx-4 sm:mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <Input
          label={t('vendor_name')}
          {...register('vendorName')}
          error={errors.vendorName?.message}
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
        
        <Input
          label={t('amount')}
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
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
          <Button variant="outline" onClick={onClose} type="button" className="w-full sm:w-auto">
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading || isSubmitting} className="w-full sm:w-auto justify-center">
            {initialData ? t('update') : t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};