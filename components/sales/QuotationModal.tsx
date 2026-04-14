
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Quotation } from '../../types';
import { useData } from '../../context/DataContext';

const quotationSchema = z.object({
  quotationNo: z.string().min(1, 'Quotation number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  quotationDate: z.string().min(1, 'Quotation date is required'),
  expirationDate: z.string().optional().nullable(),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'EXPIRED']),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quotation: Quotation) => void;
  quotationToEdit?: Quotation | null;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  quotationToEdit,
}) => {
  const { t } = useTranslation();
  const { customers } = useData();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      status: 'DRAFT',
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
    },
  });

  useEffect(() => {
    if (quotationToEdit) {
      reset({
        quotationNo: quotationToEdit.quotationNo,
        customerId: typeof quotationToEdit.customerId === 'object' ? quotationToEdit.customerId.id : quotationToEdit.customerId,
        quotationDate: quotationToEdit.quotationDate,
        expirationDate: quotationToEdit.expirationDate,
        subtotal: quotationToEdit.subtotal,
        discountAmount: quotationToEdit.discountAmount,
        taxAmount: quotationToEdit.taxAmount,
        totalAmount: quotationToEdit.totalAmount,
        notes: quotationToEdit.notes,
        termsAndConditions: quotationToEdit.termsAndConditions,
        status: quotationToEdit.status,
      });
    } else {
      reset({
        quotationNo: `QT-${Date.now()}`,
        customerId: '',
        quotationDate: new Date().toISOString().split('T')[0],
        expirationDate: '',
        subtotal: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 0,
        notes: '',
        termsAndConditions: '',
        status: 'DRAFT',
      });
    }
  }, [quotationToEdit, reset]);

  const onSubmit = (data: QuotationFormData) => {
    onSave({
      ...data,
      id: quotationToEdit?.id || '',
      items: quotationToEdit?.items || [],
    } as Quotation);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={quotationToEdit ? t('edit_quotation') : t('add_quotation')}
      className="max-w-3xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('quotation_no')}
            {...register('quotationNo')}
            error={errors.quotationNo?.message}
            required
          />
          <Select
            label={t('customer')}
            {...register('customerId')}
            error={errors.customerId?.message}
            options={customers.map(c => ({ value: c.id, label: c.customerName }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('quotation_date')}
            type="date"
            {...register('quotationDate')}
            error={errors.quotationDate?.message}
            required
          />
          <Input
            label={t('expiration_date')}
            type="date"
            {...register('expirationDate')}
            error={errors.expirationDate?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label={t('subtotal')}
            type="number"
            {...register('subtotal', { valueAsNumber: true })}
            error={errors.subtotal?.message}
          />
          <Input
            label={t('discount')}
            type="number"
            {...register('discountAmount', { valueAsNumber: true })}
            error={errors.discountAmount?.message}
          />
          <Input
            label={t('tax')}
            type="number"
            {...register('taxAmount', { valueAsNumber: true })}
            error={errors.taxAmount?.message}
          />
          <Input
            label={t('total')}
            type="number"
            {...register('totalAmount', { valueAsNumber: true })}
            error={errors.totalAmount?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('status')}
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'DRAFT', label: t('draft') },
              { value: 'SENT', label: t('sent') },
              { value: 'EXPIRED', label: t('expired') },
            ]}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('notes')}</label>
          <textarea
            {...register('notes')}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {quotationToEdit ? t('submit') : t('add_quotation')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
