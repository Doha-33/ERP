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
  rate: z.number().min(0, 'Rate must be positive').max(100, 'Rate cannot exceed 100%'),
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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<TaxFormData>({
    resolver: zodResolver(taxSchema),
    defaultValues: {
      taxName: '',
      taxCode: '',
      taxType: 'VAT',
      rate: 0,
      isActive: true,
      notes: '',
    }
  });

  const taxType = watch('taxType');
  const rate = watch('rate');

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
      // Auto-generate tax code based on tax type
      const prefix = taxType === 'VAT' ? 'VAT' : taxType === 'WITHHOLDING' ? 'WHT' : 'ST';
      reset({
        taxName: '',
        taxCode: `${prefix}-${Date.now().toString().slice(-4)}`,
        taxType: 'VAT',
        rate: 0,
        isActive: true,
        notes: '',
      });
    }
  }, [initialData, reset, taxType]);

  const onSubmitForm = async (data: TaxFormData) => {
    await onSubmit(data);
  };

  const getRateHelperText = () => {
    if (taxType === 'VAT') return t('vat_rate_helper');
    if (taxType === 'WITHHOLDING') return t('withholding_rate_helper');
    return t('sales_tax_rate_helper');
  };

  const taxTypeOptions = [
    { value: 'VAT', label: t('vat') },
    { value: 'WITHHOLDING', label: t('withholding') },
    { value: 'SALES_TAX', label: t('sales_tax') },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? t('edit_tax') : t('add_tax')}
      className="w-full max-w-md mx-4 sm:mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4" dir={isRTL ? "rtl" : "ltr"}>
        <Input
          label={t('tax_name')}
          {...register('taxName')}
          error={errors.taxName?.message}
          required
          fullWidth
          placeholder={t('enter_tax_name')}
        />
        
        <Input
          label={t('tax_code')}
          {...register('taxCode')}
          error={errors.taxCode?.message}
          required
          fullWidth
          placeholder={t('enter_tax_code')}
        />
        
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
          <Select
            label={t('tax_type')}
            options={taxTypeOptions}
            {...register('taxType')}
            error={errors.taxType?.message}
            required
            fullWidth
          />
          <Input
            label={t('rate')}
            type="number"
            step="0.01"
            {...register('rate', { valueAsNumber: true })}
            error={errors.rate?.message}
            required
            fullWidth
          />
        </div>

        {/* Rate preview */}
        {rate > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('calculation_preview')}:</span>
              <div className="text-right">
                <span className="text-gray-600">100 + {rate}% = </span>
                <span className="font-semibold text-blue-600">{(100 + rate).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            {t('active')}
          </label>
        </div>
        
        <TextArea
          label={t('notes')}
          {...register('notes')}
          error={errors.notes?.message}
          fullWidth
          rows={3}
          placeholder={t('optional_notes')}
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