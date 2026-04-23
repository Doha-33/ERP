import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input, Button, Select, TextArea } from '../ui/Common';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CHECK', 'ONLINE']),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  notes: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  title: string;
  invoices: { id: string; label: string; remainingAmount: number }[];
  isLoading?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  invoices,
  isLoading
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoiceId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      amount: 0,
      paymentMethod: 'BANK_TRANSFER',
      referenceNumber: '',
      notes: '',
    }
  });

  const selectedInvoiceId = watch('invoiceId');
  
  React.useEffect(() => {
    if (selectedInvoiceId) {
      const invoice = invoices.find(i => i.id === selectedInvoiceId);
      if (invoice) {
        setValue('amount', invoice.remainingAmount);
      }
    }
  }, [selectedInvoiceId, invoices, setValue]);

  React.useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Select
          label={t('invoice')}
          options={[
            { value: '', label: t('select_invoice') },
            ...invoices.map(inv => ({ 
              value: inv.id, 
              label: `${inv.label} (${t('remaining')}: ${inv.remainingAmount})` 
            }))
          ]}
          {...register('invoiceId')}
          error={errors.invoiceId?.message}
          fullWidth
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('payment_date')}
            type="date"
            {...register('paymentDate')}
            error={errors.paymentDate?.message}
          />
          <Input
            label={t('amount')}
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            error={errors.amount?.message}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('payment_method')}
            options={[
              { value: 'CASH', label: t('cash') },
              { value: 'BANK_TRANSFER', label: t('bank_transfer') },
              { value: 'CHECK', label: t('check') },
              { value: 'ONLINE', label: t('online') },
            ]}
            {...register('paymentMethod')}
            error={errors.paymentMethod?.message}
          />
          <Input
            label={t('reference_number')}
            {...register('referenceNumber')}
            error={errors.referenceNumber?.message}
          />
        </div>
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
            {t('record_payment')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
