import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input, Button, Select, TextArea } from '../ui/Common';
import { Tax } from '../../types';

const taxSchema = z.object({
  taxName: z.string().min(1, 'Tax name is required'),
  taxCode: z.string().min(1, 'Tax code is required'),
  taxType: z.enum(['VAT', 'WITHHOLDING', 'SALES_TAX']),
  rate: z.number().min(0, 'Rate must be positive'),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

type TaxFormData = z.infer<typeof taxSchema>;

interface TaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxFormData) => Promise<void>;
  initialData?: Tax | null;
  isLoading?: boolean;
}

export const TaxModal: React.FC<TaxModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema) as any,
    defaultValues: {
      taxName: '',
      taxCode: '',
      taxType: 'VAT',
      rate: 0,
      isActive: true,
      notes: '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        taxName: initialData.taxName,
        taxCode: initialData.taxCode,
        taxType: initialData.taxType as any,
        rate: initialData.rate,
        isActive: initialData.isActive,
        notes: initialData.notes || '',
      });
    } else {
      reset({
        taxName: '',
        taxCode: '',
        taxType: 'VAT',
        rate: 0,
        isActive: true,
        notes: '',
      });
    }
  }, [initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('edit_tax') : t('add_tax')}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <Input
          label={t('tax_name')}
          {...register('taxName')}
          error={errors.taxName?.message}
          fullWidth
        />
        <Input
          label={t('tax_code')}
          {...register('taxCode')}
          error={errors.taxCode?.message}
          fullWidth
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('tax_type')}
            options={[
              { value: 'VAT', label: 'VAT' },
              { value: 'WITHHOLDING', label: 'Withholding' },
              { value: 'SALES_TAX', label: 'Sales Tax' },
            ]}
            {...register('taxType')}
            error={errors.taxType?.message}
          />
          <Input
            label={t('rate')}
            type="number"
            step="0.01"
            {...register('rate', { valueAsNumber: true })}
            error={errors.rate?.message}
          />
        </div>
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('active')}
            </label>
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
            {initialData ? t('update') : t('create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
