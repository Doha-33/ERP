
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Modal } from '../ui/Modal';
import { Button, Input, Select } from '../ui/Common';
import { Discount } from '../../types';
import { useData } from '../../context/DataContext';

const discountSchema = z.object({
  discountName: z.string().min(1, 'Discount name is required'),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y']),
  appliesTo: z.enum(['PRODUCT', 'CATEGORY', 'CUSTOMER', 'CUSTOMER_GROUP', 'ORDER_TOTAL']),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  customerId: z.string().optional(),
  value: z.number().min(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discount: any) => void;
  discountToEdit?: Discount | null;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  discountToEdit,
}) => {
  const { t } = useTranslation();
  const { customers, products, categories } = useData();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      status: 'ACTIVE',
      type: 'PERCENTAGE',
      appliesTo: 'PRODUCT',
      value: 0,
    },
  });

  const appliesTo = watch('appliesTo');

  useEffect(() => {
    if (discountToEdit) {
      reset({
        discountName: discountToEdit.discountName,
        type: discountToEdit.type,
        appliesTo: discountToEdit.appliesTo,
        productId: typeof discountToEdit.productId === 'object' ? discountToEdit.productId?.id : discountToEdit.productId,
        categoryId: discountToEdit.categoryId,
        customerId: typeof discountToEdit.customerId === 'object' ? discountToEdit.customerId?.id : discountToEdit.customerId,
        value: discountToEdit.value,
        startDate: discountToEdit.startDate ? new Date(discountToEdit.startDate).toISOString().split('T')[0] : '',
        endDate: discountToEdit.endDate ? new Date(discountToEdit.endDate).toISOString().split('T')[0] : '',
        status: discountToEdit.status,
      });
    } else {
      reset({
        discountName: '',
        type: 'PERCENTAGE',
        appliesTo: 'PRODUCT',
        value: 0,
        status: 'ACTIVE',
      });
    }
  }, [discountToEdit, reset]);

  const onSubmit = (data: DiscountFormData) => {
    onSave({
      ...data,
      id: discountToEdit?.id || undefined,
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={discountToEdit ? t('edit_discount') : t('add_discount')}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('discount_name')}
            {...register('discountName')}
            error={errors.discountName?.message}
            required
          />
          <Select
            label="Status"
            {...register('status')}
            error={errors.status?.message}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'EXPIRED', label: 'Expired' },
            ]}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Discount Type"
            {...register('type')}
            error={errors.type?.message}
            options={[
              { value: 'PERCENTAGE', label: 'Percentage' },
              { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
              { value: 'BUY_X_GET_Y', label: 'Buy X Get Y' },
            ]}
            required
          />
          <Input
            label="Value"
            type="number"
            {...register('value', { valueAsNumber: true })}
            error={errors.value?.message}
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300">{t('applies_to')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Applies To"
              {...register('appliesTo')}
              error={errors.appliesTo?.message}
              options={[
                { value: 'PRODUCT', label: 'Product' },
                { value: 'CATEGORY', label: 'Category' },
                { value: 'CUSTOMER', label: 'Customer' },
                { value: 'CUSTOMER_GROUP', label: 'Customer Group' },
                { value: 'ORDER_TOTAL', label: 'Order Total' },
              ]}
              required
            />
            {appliesTo === 'PRODUCT' && (
              <Select
                label="Product"
                {...register('productId')}
                error={errors.productId?.message}
                options={products.map(p => ({ value: p.id, label: p.productName }))}
              />
            )}
            {appliesTo === 'CUSTOMER' && (
              <Select
                label="Customer"
                {...register('customerId')}
                error={errors.customerId?.message}
                options={customers.map(c => ({ value: c.id, label: c.customerName }))}
              />
            )}
            {appliesTo === 'CATEGORY' && (
              <Select
                label="Category"
                {...register('categoryId')}
                error={errors.categoryId?.message}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('from_date')}
            type="date"
            {...register('startDate')}
            error={errors.startDate?.message}
          />
          <Input
            label={t('to_date')}
            type="date"
            {...register('endDate')}
            error={errors.endDate?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">
            {discountToEdit ? t('submit') : t('add_discounts')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
