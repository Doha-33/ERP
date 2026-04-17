import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input, Button, TextArea } from '../ui/Common';
import { AccountPayable } from '../../types';

// Define the schema with explicit types
const apSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'), // Changed from z.coerce.number()
  notes: z.string().optional(),
});

// Explicitly define the type
type APFormData = {
  vendorName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  notes?: string;
};

// Or use z.infer with a type assertion
// type APFormData = z.infer<typeof apSchema>;

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
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<APFormData>({
    resolver: zodResolver(apSchema),
    defaultValues: {
      vendorName: '',
      invoiceNumber: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      amount: 0,
      notes: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        vendorName: initialData.vendorName,
        invoiceNumber: initialData.invoiceNumber,
        invoiceDate: initialData.invoiceDate?.split('T')[0] || '',
        dueDate: initialData.dueDate?.split('T')[0] || '',
        amount: initialData.amount,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        vendorName: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        amount: 0,
        notes: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit = async (data: APFormData) => {
    // Ensure amount is a number (it should be already)
    const submitData = {
      ...data,
      amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
    };
    await onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('edit_accounts_payable') : t('add_accounts_payable')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
        <Input
          label={t('vendor_name')}
          {...register('vendorName')}
          error={errors.vendorName?.message}
          fullWidth
        />
        <Input
          label={t('invoice_number')}
          {...register('invoiceNumber')}
          error={errors.invoiceNumber?.message}
          fullWidth
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('invoice_date')}
            type="date"
            {...register('invoiceDate')}
            error={errors.invoiceDate?.message}
            fullWidth
          />
          <Input
            label={t('due_date')}
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
            fullWidth
          />
        </div>
        <Input
          label={t('amount')}
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })} // Add valueAsNumber
          error={errors.amount?.message}
          fullWidth
        />
        <TextArea
          label={t('notes')}
          {...register('notes')}
          error={errors.notes?.message}
          fullWidth
        />
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} type="button">
            {t('cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {initialData ? t('update') : t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};