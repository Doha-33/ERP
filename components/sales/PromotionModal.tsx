
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Promotion } from '../../types';

const promotionSchema = z.object({
  promotionName: z.string().min(1, 'Promotion name is required'),
  type: z.enum(['PERCENTAGE', 'FIXED', 'BUY_X_GET_Y', 'FREE_SHIPPING']),
  conditionType: z.enum(['ORDER_TOTAL', 'PROMO_CODE', 'PRODUCT', 'CUSTOMER_TYPE']),
  value: z.number().min(0, 'Value must be positive'),
  benefitDescription: z.string().min(1, 'Benefit description is required'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'SCHEDULED', 'EXPIRED']),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotion: Promotion) => void;
  promotionToEdit?: Promotion | null;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  promotionToEdit,
}) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      type: 'PERCENTAGE',
      conditionType: 'ORDER_TOTAL',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    if (promotionToEdit) {
      reset({
        promotionName: promotionToEdit.promotionName,
        type: promotionToEdit.type,
        conditionType: promotionToEdit.conditionType,
        value: promotionToEdit.value,
        benefitDescription: promotionToEdit.benefitDescription,
        startDate: promotionToEdit.startDate,
        endDate: promotionToEdit.endDate,
        status: promotionToEdit.status,
      });
    } else {
      reset({
        promotionName: '',
        type: 'PERCENTAGE',
        conditionType: 'ORDER_TOTAL',
        value: 0,
        benefitDescription: '',
        startDate: '',
        endDate: '',
        status: 'ACTIVE',
      });
    }
  }, [promotionToEdit, reset]);

  const onSubmit = (data: PromotionFormData) => {
    onSave({
      ...data,
      id: promotionToEdit?.id || '',
    } as Promotion);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={promotionToEdit ? t('edit_promotion') : t('add_promotion')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('promotion_name')}
            {...register('promotionName')}
            error={errors.promotionName?.message}
            required
            placeholder="Summer Sale"
          />
          <Select
            label={t('type')}
            {...register('type')}
            error={errors.type?.message}
            options={[
              { value: 'PERCENTAGE', label: t('percentage') },
              { value: 'FIXED', label: t('fixed_amount') },
              { value: 'BUY_X_GET_Y', label: t('buy_x_get_y') },
              { value: 'FREE_SHIPPING', label: t('free_shipping') },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('condition_type')}
            {...register('conditionType')}
            error={errors.conditionType?.message}
            options={[
              { value: 'ORDER_TOTAL', label: t('order_total') },
              { value: 'PROMO_CODE', label: t('promo_code') },
              { value: 'PRODUCT', label: t('specific_product') },
              { value: 'CUSTOMER_TYPE', label: t('customer_type') },
            ]}
            required
          />
          <Input
            label={t('value')}
            type="number"
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('start_date')}
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
          <Input
            label={t('end_date')}
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t('status')}
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'ACTIVE', label: t('active') },
              { value: 'SCHEDULED', label: t('scheduled') },
              { value: 'EXPIRED', label: t('expired') },
            ]}
            required
          />
          <Input
            label={t('benefit_description')}
            {...register('benefitDescription')}
            error={errors.benefitDescription?.message}
            required
            placeholder="Get 20% off on orders over $100"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {promotionToEdit ? t('submit') : t('add_promotion')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
