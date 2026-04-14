
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { PricingRule } from '../../types';

const pricingRuleSchema = z.object({
  ruleName: z.string().min(1, 'Rule name is required'),
  condition: z.string().min(1, 'Condition is required'),
  priceChange: z.string().min(1, 'Price change is required'),
  status: z.enum(['Active', 'Inactive']),
  product: z.string().min(1, 'Product is required'),
  customer: z.string().min(1, 'Customer is required'),
});

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>;

interface PricingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: PricingRule) => void;
  ruleToEdit?: PricingRule | null;
}

export const PricingRuleModal: React.FC<PricingRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ruleToEdit,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      status: 'Active',
    },
  });

  useEffect(() => {
    if (ruleToEdit) {
      reset(ruleToEdit);
    } else {
      reset({
        ruleName: '',
        condition: '',
        priceChange: '',
        status: 'Active',
        product: '',
        customer: '',
      });
    }
  }, [ruleToEdit, reset]);

  const onSubmit = (data: PricingRuleFormData) => {
    onSave({
      ...data,
      id: ruleToEdit?.id || '',
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={ruleToEdit ? t('edit_pricing_rule') : t('add_pricing_rule')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('rule_name')}
            {...register('ruleName')}
            error={errors.ruleName?.message}
            options={[
              { value: '002', label: '002' },
              { value: '003', label: '003' },
            ]}
            required
          />
          <Input
            label={t('condition')}
            {...register('condition')}
            error={errors.condition?.message}
            required
          />
          <Input
            label={t('price_change')}
            {...register('priceChange')}
            error={errors.priceChange?.message}
            required
          />
          {ruleToEdit && (
            <Select
              label={t('status')}
              {...register('status')}
              error={errors.status?.message}
              options={[
                { value: 'Active', label: t('active') },
                { value: 'Inactive', label: t('inactive') },
              ]}
              required
            />
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">{t('applies_to')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t('product')}
              {...register('product')}
              error={errors.product?.message}
              options={[
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Mobile', label: 'Mobile' },
              ]}
            />
            <Select
              label={t('customer')}
              {...register('customer')}
              error={errors.customer?.message}
              options={[
                { value: 'Mohamed', label: 'Mohamed' },
                { value: 'Ahmed', label: 'Ahmed' },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {ruleToEdit ? t('submit') : t('add_pricing_rules')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
