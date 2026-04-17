import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { Input, Button, Select, TextArea } from '../ui/Common';
import { Tax } from '../../types';

// Fix: Make isActive required by using .default() with proper typing
const taxSchema = z.object({
  taxName: z.string().min(1, 'Tax name is required'),
  taxCode: z.string().min(1, 'Tax code is required'),
  taxType: z.enum(['VAT', 'WITHHOLDING', 'SALES_TAX']),
  rate: z.number().min(0, 'Rate must be positive'),
  isActive: z.boolean().default(true), // This creates optional in schema but required in form data
  notes: z.string().optional(),
});

// Explicitly define the form data type to avoid inference issues
type TaxFormData = {
  taxName: string;
  taxCode: string;
  taxType: 'VAT' | 'WITHHOLDING' | 'SALES_TAX';
  rate: number;
  isActive: boolean;
  notes?: string;
};

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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema) as any, // Type assertion to bypass complex type inference
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
        isActive: initialData.isActive ?? true,
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

  // Submit handler wrapper
  const handleFormSubmit = async (data: TaxFormData) => {
    // Ensure rate is a number and isActive is boolean
    const submitData = {
      ...data,
      rate: typeof data.rate === 'string' ? parseFloat(data.rate) : data.rate,
      isActive: data.isActive === true,
    };
    await onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('edit_tax') : t('add_tax')}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
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
            fullWidth
          />
          <Input
            label={t('rate')}
            type="number"
            step="0.01"
            {...register('rate', { valueAsNumber: true })}
            error={errors.rate?.message}
            fullWidth
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